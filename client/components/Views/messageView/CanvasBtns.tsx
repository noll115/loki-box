import { TouchableOpacity, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    block,
    call,
    cond,
    divide,
    eq,
    interpolateColors,
    max,
    min,
    set,
    sub,
    round,
    interpolate,
    useValue,
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, Pressable, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SketchState, ReducerActions, CanvasActions, CanvasTools, CanvasState } from "./../../../types/sketchCanvas";
import Svg, { Path } from 'react-native-svg';
import { STROKE_SIZES, TEXT_SIZES } from '../../../constants';


const SELECTOR_SIZE = 30


const ColorSlider: React.FC<{ setColor(col: string): void }> = ({ setColor }) => {
    let width = useValue<number>(0);
    let selectingState = useValue<number>(0);
    let colors = [];
    let ranges: number[] = [];
    let transX = useValue(0);

    colors.push('hsl(0, 100%, 100%)')
    for (let i = 0; i < 360; i += 360 / 6) {
        colors.push(`hsl(${i}, 100%, 50%)`)
    }
    colors.push('hsl(360, 100%, 0%)')
    for (let i = 0; i < colors.length; i++) {
        ranges.push(Math.round(10 * (i / colors.length)) / 10)
    }

    let selectorCol = interpolateColors(divide(transX, width), {
        inputRange: ranges,
        outputColorRange: colors,
    })

    let changeColor = ([col]: readonly number[]) => {
        setColor("#" + (col & 0x00FFFFFF).toString(16).padStart(6, '0'))
    }
    let panHandler = Animated.event([
        {
            nativeEvent: ({ state, x }: any) => block([
                set(transX, max(min(x, width), 0)),
                cond(
                    eq(state, State.BEGAN),
                    set(selectingState, 1)
                ),
                cond(
                    eq(state, State.END),
                    [
                        set(selectingState, 0),
                        call([selectorCol], changeColor)
                    ],
                ),

            ])
        },
    ]);



    return (
        <PanGestureHandler
            onGestureEvent={panHandler}
            onHandlerStateChange={panHandler}
        >
            <Animated.View style={canvasBtnStyle.slider}>
                <View style={canvasBtnStyle.gradContainer}>
                    <LinearGradient
                        onLayout={({ nativeEvent }) => width.setValue(nativeEvent.layout.width)}
                        style={canvasBtnStyle.grad}
                        colors={colors}
                        locations={ranges}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
                <Animated.View style={[canvasBtnStyle.selector, {
                    transform: [{
                        translateX: sub(transX, SELECTOR_SIZE / 2),
                    }],
                }]} >
                    <Animated.View style={[canvasBtnStyle.selectorInner, { backgroundColor: selectorCol as any }]} />
                </Animated.View>
            </Animated.View>
        </PanGestureHandler >
    )
}

const Slider: React.FC<{ onValueChange(newVal: number): void, range: [number, number], startVal: number }> = ({ onValueChange, range, startVal }) => {

    let width = useValue<number>(100);
    let selectingState = useValue<number>(0);
    let transX = useValue<number>(0);
    let [currentValue, setCurrentValue] = useState(startVal);
    console.log('ya');

    useEffect(() => {
        onValueChange(startVal);
    }, [])


    let inputRange: number[] = [];
    let outputRange: number[] = [];
    let rangeLength = range[1] - range[0];
    let inputPerc = 1 / rangeLength;
    for (let i = 0; i <= rangeLength; i++) {
        inputRange.push(inputPerc * i);
        outputRange.push(range[0] + i);
    }

    let finalizeVal = ([x]: readonly number[]) => {
        onValueChange(x);
    }

    let updateTextVal = ([x]: readonly number[]) => {
        console.log(x);

        setCurrentValue(x);
    }

    let interpolateRange = (input: Animated.Node<number>) => round(interpolate(input, {
        inputRange,
        outputRange
    }));


    let panHandler = Animated.event([
        {
            nativeEvent: ({ state, x }: any) => block([
                set(transX, max(min(x, width), 0)),
                cond(
                    eq(state, State.BEGAN),
                    set(selectingState, 1)
                ),
                cond(
                    eq(state, State.END),
                    [
                        set(selectingState, 0),
                        call([interpolateRange(divide(transX, width))], finalizeVal)
                    ],
                ),
                cond(
                    eq(state, State.ACTIVE), [
                    call([interpolateRange(divide(transX, width))], updateTextVal)
                ]
                )
            ])
        },
    ]);
    return (
        <PanGestureHandler
            onGestureEvent={panHandler}
            onHandlerStateChange={panHandler}
        >
            <Animated.View
                style={canvasBtnStyle.slider}
            >
                <Animated.View
                    style={{ backgroundColor: 'black', width: '100%', height: 3 }}
                    onLayout={({ nativeEvent }) => width.setValue(nativeEvent.layout.width)}
                >
                </Animated.View>
                <Animated.View style={[canvasBtnStyle.selector, canvasBtnStyle.selectorSize, {
                    transform: [{
                        translateX: sub(transX, SELECTOR_SIZE / 2),
                    }],
                }]} >
                    <Animated.View style={[canvasBtnStyle.selectorInner, canvasBtnStyle.selectorInnerSize]} >
                        <Text>{currentValue}</Text>
                    </Animated.View>
                </Animated.View>

            </Animated.View>
        </PanGestureHandler >)
}

interface sketchBtnProps {
    iconName?: string,
    onPress(): void,
    disabled?: boolean,
    selected?: boolean,
    innerText?: string,
    btnStyle?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<TextStyle>
}

const SketchButton: React.FC<sketchBtnProps> = ({ iconName, onPress, disabled, selected, innerText, btnStyle, textStyle }) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[canvasBtnStyle.modeBtn, innerText !== undefined && canvasBtnStyle.modeBtnHasText, disabled && !selected && canvasBtnStyle.modeBtnDisabled, selected && canvasBtnStyle.modeBtnSelected, btnStyle]}
        >
            { iconName && <MaterialCommunityIcons style={[canvasBtnStyle.modeBtnInner, selected && canvasBtnStyle.modeBtnInnerSelected]} name={iconName as any} />}
            { !iconName && <Text style={[canvasBtnStyle.modeBtnInner, { fontSize: 18 }, textStyle]}>{innerText}</Text>}
        </Pressable >
    )
}


const ToolSizes: React.FC<{ currentTool: CanvasTools, setLineWidth(strokeSize: number): void, setTextSize(textSize: number): void }> = ({ currentTool, setLineWidth, setTextSize }) => {
    let [selected, setSelected] = useState(0);

    useEffect(() => {
        setSelected(0);
        setLineWidth(STROKE_SIZES[0]);
        setTextSize(TEXT_SIZES[0]);
    }, [currentTool])


    let btns = null;
    if (currentTool === CanvasTools.DRAW) {
        btns = STROKE_SIZES.map((strokeSize, i) =>
            <Pressable
                key={i}
                style={{ flex: 1, marginHorizontal: 5, borderRadius: 10, opacity: selected === i ? 1 : 0.6 }}
                onPress={() => {
                    setSelected(i);
                    setLineWidth(strokeSize);
                }}
            >
                <Svg style={{ width: '100%', height: '100%' }} >
                    <Path
                        d="M20,70 C70,-40 50,150 100,30"
                        strokeWidth={strokeSize}
                        fill='none'
                        strokeLinecap="round"
                        stroke='#FEF4EA' />
                </Svg>
            </Pressable>
        )
    } else {
        btns = TEXT_SIZES.map((textSize, i) =>
            <View
                key={i}
                style={{ flex: 1, marginHorizontal: 5, borderRadius: 10, opacity: selected === i ? 1 : 0.6 }}
            >
                <Pressable
                    style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                        setSelected(i);
                        setTextSize(textSize);
                    }}
                >
                    <MaterialIcons name="text-fields" size={textSize} color='#FEF4EA' />
                </Pressable>
            </View>
        )
    }

    return (
        <View style={{ flexDirection: 'row', height: 120, paddingVertical: 10, backgroundColor: '#443641', width: '100%', borderRadius: 10 }}>
            {btns}
        </View >
    );
}



function DrawingBtns(sketchState: SketchState, sketchDispatch: React.Dispatch<ReducerActions>) {
    let { currentTool } = sketchState

    let drawing = currentTool === CanvasTools.DRAW;

    let setColor = (color: string) => {
        sketchDispatch({ type: CanvasActions.SET_COLOR, color })
    }

    let setLineWidth = (lineWidth: number) => {
        sketchDispatch({ type: CanvasActions.SET_LINEWIDTH, lineWidth })
    }
    let setTextSize = (txtSize: number) => {
        sketchDispatch({ type: CanvasActions.SET_TEXT_SIZE, txtMult: txtSize });
    }

    let switchTools = () => {
        let nextTool = currentTool === CanvasTools.TEXT ? CanvasTools.DRAW : CanvasTools.TEXT;
        sketchDispatch({ type: CanvasActions.SET_TOOL, tool: nextTool })
    }

    let submit = () => {
        sketchDispatch({ type: CanvasActions.SET_STATE, state: CanvasState.SUBMITTING });
    }
    return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ alignSelf: 'flex-end', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', paddingBottom: 10, alignItems: 'center', width: '100%', height: 45 }}>
                    <View style={{ flex: 3 }}>
                        <View style={{ flexDirection: 'row', width: '40%', justifyContent: 'space-evenly' }}>
                            <SketchButton iconName='text-box-plus-outline' onPress={switchTools} disabled={!drawing} selected={!drawing} />
                            <SketchButton iconName='draw' onPress={switchTools} disabled={drawing} selected={drawing} />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <SketchButton btnStyle={{ backgroundColor: '#D4668E' }} textStyle={{ color: '#FEF4EA' }} innerText='Send' disabled={sketchState.empty || sketchState.canvasState === CanvasState.SUBMITTING} onPress={submit} />
                    </View>
                </View>
                <View style={{ width: '100%', backgroundColor: '#2D242B', paddingVertical: 10, paddingHorizontal: 5 }}>
                    <View style={{ paddingVertical: 20, marginBottom: 5, backgroundColor: '#443641', alignItems: 'center', borderRadius: 10 }}>
                        <View style={{ width: '85%' }}>
                            <ColorSlider setColor={setColor} />
                        </View>
                    </View>
                    <ToolSizes setTextSize={setTextSize} setLineWidth={setLineWidth} currentTool={currentTool} />
                </View>
            </View>
        </View >
    )
}


interface canvasBtnProps {
    sketchState: SketchState,
    sketchDispatch: React.Dispatch<ReducerActions>
}

export const Canvasbtns: React.FC<canvasBtnProps> = ({ sketchState, sketchDispatch }) => {


    return (
        <View style={canvasBtnStyle.container}>
            {DrawingBtns(sketchState, sketchDispatch)}
        </View>
    )
}


const canvasBtnStyle = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    modeBtn: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 45,
        backgroundColor: '#FEF4EA',
        alignSelf: 'center',
        opacity: 1

    },
    modeBtnInner: {
        fontSize: 27,
        color: '#2D242B',
    },
    modeBtnDisabled: {
        opacity: 0.4
    },
    modeBtnSelected: {
        backgroundColor: '#8C1C13',

    },
    modeBtnInnerSelected: {
        color: '#FEF4EA',
    },
    modeBtnHasText: {
        paddingHorizontal: 14
    },
    sliderText: {
        fontSize: 20,
        width: '80%',
    },
    slider: {
        justifyContent: 'center',
        width: '100%',
        height: 20
    },
    gradContainer: {
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    grad: {
        borderRadius: 20,
        height: '100%',
        width: '100%',
    },
    selector: {
        width: SELECTOR_SIZE,
        height: SELECTOR_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        borderRadius: SELECTOR_SIZE / 2,
        position: 'absolute'
    },
    selectorSize: {
        width: SELECTOR_SIZE * 1.3,
        height: SELECTOR_SIZE * 1.3,
        borderRadius: (SELECTOR_SIZE * 1.3) / 2
    },
    selectorInner: {
        width: '80%',
        height: '80%',
        borderRadius: SELECTOR_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectorInnerSize: {
        backgroundColor: 'white',
        borderRadius: (SELECTOR_SIZE * 1.3) / 2
    }
})