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
    useValue,
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Keyboard, KeyboardEventListener, Text } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SketchState, ReducerActions, CanvasActions, CanvasTools, CanvasState } from "./../../../types/sketchCanvas";


const BTN_SIZE = 70;
const SELECTOR_SIZE = 30
const WHITE = -1;


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

const StrokeSlider: React.FC<{ setLineWidth(width: number): void, lineWidth: number }> = ({ setLineWidth, lineWidth }) => {

    let width = useValue<number>(100);
    let selectingState = useValue<number>(0);
    let transX = useValue<number>(0);
    let [strokeWidth, setStrokeWidth] = useState(lineWidth);
    let changeCanvasWith = ([x]: readonly number[]) => {
        setLineWidth(Math.ceil(12 + (x * 12)));
    }

    let updateTextVal = ([x]: readonly number[]) => {
        setStrokeWidth(Math.ceil(12 + (x * 12)));
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
                        call([divide(transX, width)], changeCanvasWith)
                    ],
                ),
                call([divide(transX, width)], updateTextVal)
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
                        <Text>{strokeWidth}</Text>
                    </Animated.View>
                </Animated.View>

            </Animated.View>
        </PanGestureHandler >)
}






function DrawingBtns(sketchState: SketchState, sketchDispatch: React.Dispatch<ReducerActions>) {
    let { currentTool, lineWidth } = sketchState

    let txtAddition = currentTool === CanvasTools.TEXT ? 'Text' : 'Stroke';

    let setColor = (color: string) => {
        sketchDispatch({ type: CanvasActions.SET_COLOR, color })
    }

    let setLineWidth = (lineWidth: number) => {
        sketchDispatch({ type: CanvasActions.SET_LINEWIDTH, lineWidth })
    }

    let switchTools = () => {
        let nextTool = currentTool === CanvasTools.TEXT ? CanvasTools.DRAW : CanvasTools.TEXT;
        sketchDispatch({ type: CanvasActions.SET_TOOL, tool: nextTool })
    }
    let clearCanvas = () => {
        sketchDispatch({ type: CanvasActions.CLEAR_CANVAS });
    }
    let submit = () => {
        sketchDispatch({ type: CanvasActions.SET_STATE, state: CanvasState.SUBMITTING });
    }
    return (
        <View style={{ width: '100%', height: '100%' }}>
            <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={canvasBtnStyle.sliderText}>{txtAddition} Color:</Text>
                <ColorSlider setColor={setColor} />
                <Text style={canvasBtnStyle.sliderText}>{txtAddition} Size:</Text>
                <StrokeSlider setLineWidth={setLineWidth} lineWidth={lineWidth} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <TouchableOpacity style={[canvasBtnStyle.modeBtn, sketchState.empty && canvasBtnStyle.modeBtnDisabled]}
                    onPress={submit}
                    disabled={sketchState.empty}
                >
                    <MaterialCommunityIcons name="send" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={clearCanvas}
                    style={[canvasBtnStyle.modeBtn, { backgroundColor: '#8C1C13' }]}
                >
                    <Feather name="trash-2" size={BTN_SIZE / 3} color="#FEF4EA" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={switchTools}
                    style={[canvasBtnStyle.modeBtn, currentTool === CanvasTools.TEXT && canvasBtnStyle.modeBtnSelected]}
                    disabled={currentTool === CanvasTools.TEXT}
                >
                    <MaterialCommunityIcons name="text-box-plus-outline" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={switchTools}
                    style={[canvasBtnStyle.modeBtn, currentTool === CanvasTools.DRAW && canvasBtnStyle.modeBtnSelected]}
                    disabled={currentTool === CanvasTools.DRAW}
                >
                    <MaterialCommunityIcons name="draw" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
            </View>
        </View>
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
        width: BTN_SIZE,
        height: BTN_SIZE,
        backgroundColor: '#FEF4EA',
        borderRadius: BTN_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modeBtnDisabled: {
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: '#FFB8D0'
    },
    modeBtnSelected: {
        backgroundColor: '#FFB8D0',
        shadowOpacity: 0,
        elevation: 0,
    },
    sliderText: {
        fontSize: 20,
        width: '80%',
    },
    slider: {
        justifyContent: 'center',
        width: '80%',
        height: 100,
    },
    gradContainer: {
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    grad: {
        borderRadius: 20,
        height: 20,
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