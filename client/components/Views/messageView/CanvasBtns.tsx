import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useSharedValue,
    runOnJS,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useMemo } from 'react'
import { StyleSheet, View, Text, Pressable, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SketchState, ReducerActions, CanvasActions, CanvasTools, CanvasState } from "./../../../types/sketchCanvas";
import Svg, { Path } from 'react-native-svg';
import { STROKE_SIZES, TEXT_SIZES } from '../../../constants';


const SELECTOR_SIZE = 30


const ColorSlider: React.FC<{ setColor(col: string): void }> = ({ setColor }) => {
    let width = useSharedValue(0);

    let colors = useMemo(() => {
        const c: string[] = [];
        c.push('hsl(0, 100%, 100%)')
        for (let i = 0; i < 360; i += 360 / 6) {
            c.push(`hsl(${i}, 100%, 50%)`)
        }
        c.push('hsl(360, 100%, 0%)')
        return c;
    }, []);
    let ranges = useMemo(() => {
        const r: number[] = [];
        for (let i = 0; i < colors.length; i++) {
            r.push(Math.round(10 * (i / colors.length)) / 10)
        }
        return r;
    }, []);

    let transX = useSharedValue(0);

    let percentage = useDerivedValue(() => {
        return transX.value / width.value;
    });

    let changeColor = (col: number) => {
        setColor("#" + (col & 0x00FFFFFF).toString(16).padStart(6, '0'))
    }

    const handler = useAnimatedGestureHandler({
        onStart: (event) => {
            transX.value = Math.max(Math.min(event.x, width.value), 0)
        },
        onActive: (event) => {
            transX.value = Math.max(Math.min(event.x, width.value), 0)
        },
        onEnd: () => {
            let newCol = interpolateColor(percentage.value, ranges, colors) as number;
            runOnJS(changeColor)(newCol);
        }
    }, []);




    const selectorAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: transX.value - (SELECTOR_SIZE / 2) }]
        }
    });
    const selectorInnerAnimStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(percentage.value, ranges, colors)
        }
    })


    return (
        <PanGestureHandler
            onHandlerStateChange={handler}
        >
            <Animated.View style={canvasBtnStyle.slider}>
                <View style={canvasBtnStyle.gradContainer}>
                    <LinearGradient
                        onLayout={({ nativeEvent }) => width.value = nativeEvent.layout.width}
                        style={canvasBtnStyle.grad}
                        colors={colors}
                        locations={ranges}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
                <Animated.View style={[canvasBtnStyle.selector, selectorAnimStyle]} >
                    <Animated.View style={[canvasBtnStyle.selectorInner, selectorInnerAnimStyle]} />
                </Animated.View>
            </Animated.View>
        </PanGestureHandler >
    )
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
            {iconName && <MaterialCommunityIcons style={[canvasBtnStyle.modeBtnInner, selected && canvasBtnStyle.modeBtnInnerSelected]} name={iconName as any} />}
            {!iconName && <Text style={[canvasBtnStyle.modeBtnInner, { fontSize: 18 }, textStyle]}>{innerText}</Text>}
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

const Canvasbtns: React.FC<canvasBtnProps> = ({ sketchState, sketchDispatch }) => {

    return (
        <View style={canvasBtnStyle.container}>
            {DrawingBtns(sketchState, sketchDispatch)}
        </View>
    )
}

export default React.memo(Canvasbtns, (prevProps, nextProps) => {
    return prevProps.sketchState.currentTool === nextProps.sketchState.currentTool && prevProps.sketchState.empty == nextProps.sketchState.empty;
})


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