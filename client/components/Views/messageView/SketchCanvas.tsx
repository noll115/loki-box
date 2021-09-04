import React, { useEffect, useMemo, useReducer, } from "react";
import { StyleSheet, useWindowDimensions, View, Text } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Animated, { and, block, call, Clock, clockRunning, cond, EasingNode, eq, neq, not, runOnJS, set, startClock, stopClock, timing, useAnimatedGestureHandler, useAnimatedStyle, useDerivedValue, useSharedValue, useValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Path, Svg, Text as SVGText } from 'react-native-svg'
import Canvasbtns from "./CanvasBtns";
import CanvasTextInput from "./CanvasTextInput";
import { SketchState, ReducerActions, CanvasActions, CanvasTools, CanvasState, Line, TextData } from "./../../../types/sketchCanvas";
import { AntDesign } from "@expo/vector-icons";
import { Socket } from "socket.io-client";
import { IBox, IMessageData } from "../../../types/general";


let INIT_STATE: SketchState = {
    color: '#FFFFFF',
    lineWidth: 12,
    textSize: 1,
    currentTool: CanvasTools.DRAW,
    canvasState: CanvasState.EDITING,
    scale: 1,
    currentLine: null,
    lines: [],
    texts: [],
    editingText: false,
    empty: true
}




let canvasReducer = (prevState: SketchState, action: ReducerActions): SketchState => {
    switch (action.type) {
        case CanvasActions.SET_COLOR:
            return { ...prevState, color: action.color }
        case CanvasActions.SET_LINEWIDTH:
            return { ...prevState, lineWidth: action.lineWidth };
        case CanvasActions.SET_TEXT_SIZE:
            return { ...prevState, textSize: action.txtMult }
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
        case CanvasActions.EDITING_TEXT:
            return { ...prevState, editingText: action.isEditingText }
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
            return { ...prevState, texts: [...prevTexts, action.text], empty: false, editingText: true };
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


const HeartLoader: React.FC<{ canvasState: CanvasState, onSubmit: () => void }> = ({ canvasState, onSubmit }) => {


    const heartScaleStyle = useAnimatedStyle(() => {
        if (canvasState === CanvasState.SUBMITTED) {
            return {
                transform: [{
                    scale: withTiming(
                        2,
                        undefined,
                        isfinished => {
                            isfinished && runOnJS(onSubmit)()
                        })
                }]
            }
        }
        return {
            transform: [{ scale: withRepeat(withSequence(withTiming(0), withTiming(1)), -1) }]
        }
    }, [canvasState]);

    if (canvasState === CanvasState.EDITING) {
        return null;
    }

    return (
        <Animated.View style={[style.loadingScreen, { opacity: withSequence(0, withTiming(1)) }]}>
            <View style={{ height: '40%' }}>
                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FEF4EA', fontSize: 30, paddingBottom: 10, textAlign: 'center' }}>Sending...</Text>
                </View>
                <Animated.View style={[{ flex: 4 }, heartScaleStyle]}>
                    <AntDesign name="heart" size={140} color="#C5261B" />
                </Animated.View>
            </View>
        </Animated.View>
    )
}


interface Props {
    width: number,
    height: number,
    onSubmit(): void,
    socket: Socket,
    box: IBox
}

export const SketchCanvas: React.FC<Props> = ({ width, height, onSubmit, socket, box }) => {
    let [state, dispatch] = useReducer(canvasReducer, INIT_STATE);
    const window = useWindowDimensions()
    let submitting = state.canvasState === CanvasState.SUBMITTING;
    useEffect(() => {
        let scale = (window.width - 20) / width;
        dispatch({ type: CanvasActions.SET_SCALE, scale })
    }, [window])

    useEffect(() => {
        if (state.canvasState === CanvasState.SUBMITTING) {
            let msgData: IMessageData = {
                texts: state.texts,
                lines: state.lines
            }

            socket.emit('sendMsg', box.boxID, msgData, resp => {
                console.log(resp);

                if (resp.status === 'ok') {
                    return;
                }
                dispatch({ type: CanvasActions.SET_STATE, state: CanvasState.EDITING })
            })
        }
    }, [state.canvasState])



    const addText = (x: number, y: number) => {

        let newText: TextData = {
            text: '',
            txtSize: state.textSize,
            pos: [x, y],
            color: state.color
        };

        dispatch({ type: CanvasActions.ADD_TEXT, text: newText })
    }


    let startDraw = (x: number, y: number) => {
        let newLine: Line = {
            color: state.color,
            lineWidth: state.lineWidth,
            points: [x, y],
            lineStr: `M ${x} ${y}`
        }
        dispatch({ type: CanvasActions.SET_CURRENTLINE, line: newLine })
    }
    let activeDraw = (x: number, y: number) => {
        x = Math.min(Math.max(0, x), width);
        y = Math.min(Math.max(0, y), height);
        let line = state.currentLine;
        if (line) {
            let points = [...line.points, x, y];
            let lineStr = `${line.lineStr} ${bezierCommand(points.length - 2, points)}`
            // let lineStr = `${line.lineStr} L ${x} ${y}`;
            dispatch({ type: CanvasActions.SET_CURRENTLINE, line: { ...line, points, lineStr } })
        }
    }

    let endDraw = () => {
        if (state.currentLine) {
            dispatch({ type: CanvasActions.CURRENT_LINE_FINISHED })
        }
    }


    const handlePanGesture = useAnimatedGestureHandler({
        onStart: ({ x, y }) => {
            x = Math.round(x);
            y = Math.round(y);
            if (state.currentTool === CanvasTools.DRAW) {
                runOnJS(startDraw)(x, y);
            }
        },
        onActive: ({ x, y }) => {
            x = Math.round(x);
            y = Math.round(y);
            if (state.currentTool === CanvasTools.DRAW) {
                runOnJS(activeDraw)(x, y);
            }
        },
        onEnd: ({ x, y }) => {
            x = Math.round(x);
            y = Math.round(y);
            if (state.currentTool === CanvasTools.DRAW) {
                runOnJS(endDraw)();
            } else {
                runOnJS(addText)(x, y);
            }
        }
    })

    // let paths = useMemo(() => state.lines.map((line, i) => createPath(line, i)), [state.lines])

    const heartLoader = useMemo(() => <HeartLoader canvasState={state.canvasState} onSubmit={onSubmit} />, [state.canvasState, onSubmit]);

    return (
        <>
            <View style={{ transform: [{ scale: state.scale }], marginBottom: (state.scale * height) - height }}>
                <PanGestureHandler maxPointers={1}
                    onGestureEvent={submitting ? undefined : handlePanGesture}
                    enabled={!state.editingText}
                >
                    <Animated.View>
                        <Svg
                            style={{
                                backgroundColor: 'black',
                                height: height,
                                width: width,
                                borderRadius: 10
                            }}
                        >
                            {/* {paths} */}
                            {state.lines.map((line, i) => <SVGPath line={line} key={i} />)}
                            {state.currentLine && <SVGPath line={state.currentLine} />}
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
            </View >
            <Canvasbtns sketchState={state} sketchDispatch={dispatch} />
            {heartLoader}
        </>
    );
}
const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

const controlPoint = (current: number[], previous: number[] | null, next: number[] | null, reverse: boolean) => {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current
    const n = next || current
    // The smoothing ratio
    const smoothing = 0.2
    // Properties of the opposed-line
    const o = line(p, n)
    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing
    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100]
}
// i-2,i-1,i,i+1,
//[ x , y ,x, y ,x,y,x,y]
const bezierCommand = (i: number, a: number[]) => {
    // start control point
    const point = [a[i], a[i + 1]]; //point i
    const point2 = [a[i - 2], a[i - 1]]; // point i-1
    const point3 = a[i - 3] ? [a[i - 4], a[i - 3]] : null; // point i-2
    const point4 = a[i + 2] ? [a[i + 2], a[i + 3]] : null; // point i-2
    const [cpsX, cpsY] = controlPoint(point2, point3, point, false)
    // end control point
    const [cpeX, cpeY] = controlPoint(point, point2, point4, true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
}


const style = StyleSheet.create({
    loadingScreen: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
})
const SVGPath = React.memo<{ line: Line }>(({ line }) => {
    let { points, lineWidth, color, lineStr } = line;
    // let d = `M ${points[0]} ${points[1]}`;
    // for (let i = 2; i < points.length; i += 2) {
    //     d += bezierCommand(i, points);
    // }
    return (
        <Path
            d={lineStr}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            stroke={color}
        />
    )
})