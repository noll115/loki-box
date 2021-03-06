import React, { useEffect, useMemo, useReducer, } from "react";
import { StyleSheet, useWindowDimensions, View, Text } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Animated, { and, block, call, Clock, cond, Easing, eq, neq, not, set, startClock, stopClock, timing, useValue } from "react-native-reanimated";
import { Path, Svg, Text as SVGText } from 'react-native-svg'
import { Canvasbtns } from "./CanvasBtns";
import CanvasTextInput from "./CanvasTextInput";
import { SketchState, ReducerActions, CanvasActions, CanvasTools, CanvasState, Line, TextData } from "./../../../types/sketchCanvas";
import { AntDesign } from "@expo/vector-icons";
import { Socket } from "socket.io-client";
import { IBox, IMessageData } from "../../../types/general";


let INIT_STATE: SketchState = {
    color: '#FFFFFF',
    lineWidth: 12,
    textSizeMultiplier: 1,
    currentTool: CanvasTools.DRAW,
    canvasState: CanvasState.EDITING,
    scale: 1,
    currentLine: null,
    lines: [],
    texts: [],
    empty: true
}




let canvasReducer = (prevState: SketchState, action: ReducerActions): SketchState => {
    switch (action.type) {
        case CanvasActions.SET_COLOR:
            return { ...prevState, color: action.color }
        case CanvasActions.SET_LINEWIDTH:
            return { ...prevState, lineWidth: action.lineWidth };
        case CanvasActions.SET_TEXT_MULTIPLIER:
            return { ...prevState, textSizeMultiplier: action.textMult }
        case CanvasActions.SET_STATE:
            return { ...prevState, canvasState: action.state };
        case CanvasActions.SET_TOOL:
            return { ...prevState, currentTool: action.tool };
        case CanvasActions.SET_SCALE:
            return { ...prevState, scale: action.scale };
        case CanvasActions.CLEAR_CANVAS:
            return { ...prevState, lines: [], texts: [], empty: true };
        case CanvasActions.SET_CURRENTLINE:
            return { ...prevState, currentLine: action.line };
        case CanvasActions.CURRENT_LINE_FINISHED:
            let { lines: prevLines, currentLine, texts } = prevState;
            if (currentLine)
                if (currentLine.points.length > 2) {
                    let textLength = texts.length;
                    let newLines = [...prevLines, currentLine];
                    return { ...prevState, currentLine: null, lines: newLines, empty: (textLength === 0 && newLines.length === 0) }
                }
                else {
                    return { ...prevState, currentLine: null }
                }
            return prevState;
        case CanvasActions.ADD_TEXT:
            let { texts: prevTexts } = prevState;
            return { ...prevState, texts: [...prevTexts, action.text], empty: false };
        case CanvasActions.CHANGE_TEXT:
            let textChanging = [...prevState.texts];
            textChanging[action.index] = action.newTextData;
            return { ...prevState, texts: textChanging }
        case CanvasActions.REMOVE_TEXT:
            prevState.texts.splice(action.index, 1);
            let textLength = prevState.texts.length;
            let lineLength = prevState.lines.length;
            return { ...prevState, texts: [...prevState.texts], empty: (textLength === 0 && lineLength === 0) }
        default:
            return prevState;
    }
}

function animateOpacity(clock: Clock, shouldAnim: Animated.Value<number>) {
    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: new Animated.Value(250),
        toValue: new Animated.Value(1),
        easing: Easing.inOut(Easing.ease),
    };

    return block([
        cond(
            eq(shouldAnim, 1),
            startClock(clock),
        ),
        timing(clock, state, config),
        cond(state.finished,
            stopClock(clock)
        ),
        state.position
    ])
}

function heartAnim(clock: Clock, shouldAnim: Animated.Value<number>) {

    let pulseVal = useValue<0 | 1>(0);

    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: new Animated.Value(1000),
        toValue: new Animated.Value(1),
        easing: Easing.inOut(Easing.ease),
    };
    let shouldPulse = eq(shouldAnim, 1);
    let fillScreen = eq(shouldAnim, 2)
    let pulse = block([
        set(pulseVal, not(pulseVal)),
        cond(
            eq(pulseVal, 1),
            [
                set(state.finished, 0),
                set(state.frameTime, 0),
                set(state.time, 0),
                set(config.toValue, 0),
            ]
        ),
        cond(
            eq(pulseVal, 0),
            [
                set(state.finished, 0),
                set(state.frameTime, 0),
                set(state.time, 0),
                set(config.toValue, 1),
            ]
        ),
    ])

    return block([
        cond(
            shouldPulse,
            startClock(clock)
        ),

        // we run the step here that is going to update position
        timing(clock, state, config),
        // if the animation is over we stop the clock
        cond(state.finished, [
            cond(
                shouldPulse,
                pulse,
            ),
            cond(
                and(fillScreen, neq(config.toValue, 2)),
                [
                    set(state.finished, 0),
                    set(state.time, 0),
                    set(state.frameTime, 0),
                    set(config.toValue, 2),
                    startClock(clock)
                ],
                cond(and(fillScreen, eq(state.position, 2)),
                    stopClock(clock)
                )
            ),
        ]),
        // we made the block return the updated position
        state.position
    ]);

}


interface Props {
    width: number,
    height: number,
    bannerHeight: number,
    onSubmit(): void,
    socket: Socket,
    box: IBox
}

export const SketchCanvas: React.FC<Props> = ({ width, height, bannerHeight, onSubmit, socket, box }) => {
    let [state, dispatch] = useReducer(canvasReducer, INIT_STATE);
    const window = useWindowDimensions()
    let submitting = state.canvasState === CanvasState.SUBMITTING;

    let animateHeart = useValue<number>(0);
    let clock1 = new Clock();
    let clock2 = new Clock();
    let scaleAnim = heartAnim(clock1, animateHeart)
    let opacityAnim = animateOpacity(clock2, animateHeart);

    useEffect(() => {
        let scale = (window.width - 20) / width;
        dispatch({ type: CanvasActions.SET_SCALE, scale })
    }, [bannerHeight, window])

    useEffect(() => {
        if (state.canvasState === CanvasState.SUBMITTING) {
            animateHeart.setValue(1);
            let msgData: IMessageData = {
                texts: state.texts,
                lines: state.lines
            }
            console.log(msgData);


            socket.emit('sendMsg', box.box, msgData, resp => {
                console.log(resp);

                if (resp.status === 'ok') {
                    return animateHeart.setValue(2);
                }
                dispatch({ type: CanvasActions.SET_STATE, state: CanvasState.EDITING })
                animateHeart.setValue(0);
            })
        }
    }, [state.canvasState])



    const addText = (x: number, y: number) => {

        let newText: TextData = {
            text: '',
            txtMult: state.textSizeMultiplier,
            pos: [x, y],
            color: state.color
        };

        dispatch({ type: CanvasActions.ADD_TEXT, text: newText })
    }


    let startDraw = (x: number, y: number) => {
        let newLine = {
            color: state.color,
            lineWidth: state.lineWidth,
            points: [x, y]
        }
        dispatch({ type: CanvasActions.SET_CURRENTLINE, line: newLine })
    }
    let activeDraw = (x: number, y: number) => {
        x = Math.min(Math.max(0, x), width);
        y = Math.min(Math.max(0, y), height);
        let line = state.currentLine;
        if (line) {
            dispatch({ type: CanvasActions.SET_CURRENTLINE, line: { ...line, points: [...line.points, x, y] } })
        }
    }

    let endDraw = () => {
        if (state.currentLine) {
            dispatch({ type: CanvasActions.CURRENT_LINE_FINISHED })
        }
    }



    let handlePanGesture = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        let { x, y } = nativeEvent;
        x = Math.round(x);
        y = Math.round(y);
        switch (nativeEvent.state) {
            case State.BEGAN:
                if (state.currentTool === CanvasTools.DRAW) {
                    startDraw(x, y)
                } else {

                }
                break;
            case State.ACTIVE:
                if (state.currentTool === CanvasTools.DRAW) {
                    activeDraw(x, y);
                }
                break;
            case State.END:
                if (state.currentTool === CanvasTools.DRAW) {
                    endDraw();
                } else {
                    addText(x, y)
                }
                break;
        }
    }


    let paths = useMemo(() => {
        return state.lines.map((line, i) => createPath(line, i))
    }, [state.lines])

    let canvasBtns = useMemo(() => <Canvasbtns sketchState={state} sketchDispatch={dispatch} />, [state.currentTool, state.empty])
    let switchViews = () => {
        onSubmit();
    }

    let heartScale = Animated.interpolate(scaleAnim, {
        inputRange: [0, 1, 2],
        outputRange: [1, 1.3, 20]
    });


    return (
        <>
            <Animated.View style={{ transform: [{ scale: state.scale }] }}>
                <PanGestureHandler maxPointers={1}
                    onHandlerStateChange={submitting ? undefined : handlePanGesture}
                    onGestureEvent={submitting ? undefined : handlePanGesture}
                >
                    <Animated.View>
                        <Svg
                            style={{
                                backgroundColor: 'black',
                                height: height,
                                width: width,
                            }}
                        >
                            {paths}
                            {state.currentLine && createPath(state.currentLine)}
                        </Svg>
                    </Animated.View>
                </PanGestureHandler>
                {state.texts.map((textData, i) =>
                    <CanvasTextInput key={i}
                        textData={textData}
                        canvasWidth={width}
                        index={i}
                        sketchDispatch={dispatch}
                        canvasHeight={height}
                        enabled={!submitting && state.currentTool === CanvasTools.TEXT}
                    />
                )
                }
            </Animated.View >
            { canvasBtns}
            {
                state.canvasState === CanvasState.SUBMITTING &&
                <Animated.View style={[style.loadingScreen, { opacity: opacityAnim }]}>
                    <View style={{ height: '40%' }}>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#FEF4EA', fontSize: 30, paddingBottom: 10, textAlign: 'center' }}>Sending...</Text>
                        </View>
                        <Animated.View style={[{ flex: 4 }, {
                            transform: [{
                                scale: cond(
                                    neq(scaleAnim, 2),
                                    heartScale,
                                    [
                                        call([], switchViews),
                                        heartScale
                                    ],
                                )
                            }]
                        }]}>
                            <AntDesign name="heart" size={140} color="#C5261B" />
                        </Animated.View>
                    </View>
                </Animated.View>
            }
        </>
    );
}


const style = StyleSheet.create({
    loadingScreen: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
})

function createPath(line: Line, index?: number) {
    let { points, lineWidth, color } = line;
    let d = `M ${points[0]} ${points[1]}`;
    for (let i = 2; i < points.length; i += 2) {
        d += ` L ${points[i]} ${points[i + 1]}`;
    }
    return (
        <Path
            key={index}
            d={d}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            stroke={color}
        />
    )
}