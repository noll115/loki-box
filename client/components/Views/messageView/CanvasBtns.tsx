import { TouchableOpacity, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    abs,
    and,
    block,
    call, ceil, Clock,
    cond,
    debug,
    divide,
    Easing,
    eq,
    floor,
    interpolateColors,
    max,
    min,
    modulo,
    multiply,
    neq,
    set,
    startClock,
    stopClock,
    sub,
    timing,
    useValue,
    Value
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Keyboard, KeyboardEventListener, Text } from 'react-native';
import { CanvasTools, SketchCanvas } from './SketchCanvas';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';


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
            <Animated.View
                style={canvasBtnStyle.slider}
            >
                <View
                    style={canvasBtnStyle.gradContainer}
                >
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




interface canvasBtnProps {
    sketchCanvas: SketchCanvas
}


export const Canvasbtns: React.FC<canvasBtnProps> = ({ sketchCanvas }) => {
    let { currentTool } = sketchCanvas;
    let txtAddition = currentTool === CanvasTools.TEXT ? 'Text' : 'Stroke';

    return (
        <View style={canvasBtnStyle.container}>
            <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={canvasBtnStyle.sliderText}>{txtAddition} Color:</Text>
                <ColorSlider setColor={sketchCanvas.setColor} />
                <Text style={canvasBtnStyle.sliderText}>{txtAddition} Size:</Text>
                <StrokeSlider setLineWidth={sketchCanvas.setLineWidth} lineWidth={sketchCanvas.lineWidth} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <TouchableOpacity style={canvasBtnStyle.modeBtn}
                    onPress={() => sketchCanvas.submit()}
                >
                    <Ionicons name="ios-enter-outline" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => sketchCanvas.clearCanvas()}
                    style={[canvasBtnStyle.modeBtn, { backgroundColor: '#8C1C13' }]}
                >
                    <Feather name="trash-2" size={BTN_SIZE / 3} color="#FEF4EA" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => sketchCanvas.setCurrentTool(CanvasTools.TEXT)}
                    style={[canvasBtnStyle.modeBtn, sketchCanvas.currentTool === CanvasTools.TEXT && canvasBtnStyle.modeBtnSelected]}
                    disabled={sketchCanvas.currentTool === CanvasTools.TEXT}
                >
                    <MaterialCommunityIcons name="text-box-plus-outline" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => sketchCanvas.setCurrentTool(CanvasTools.DRAW)}
                    style={[canvasBtnStyle.modeBtn, sketchCanvas.currentTool === CanvasTools.DRAW && canvasBtnStyle.modeBtnSelected]}
                    disabled={sketchCanvas.currentTool === CanvasTools.DRAW}
                >
                    <MaterialCommunityIcons name="draw" size={BTN_SIZE / 3} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
}


const canvasBtnStyle = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
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
    modeBtnSelected: {
        backgroundColor: '#FFB8D0'
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