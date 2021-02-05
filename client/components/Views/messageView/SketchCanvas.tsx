import React, { useCallback, useEffect, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, useWindowDimensions, View } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Animated, { add, block, call, cond, debug, defined, eq, max, min, not, set, sub, useValue } from "react-native-reanimated";
import Svg, { Path, Text } from 'react-native-svg'
import CanvasTextInput from "./CanvasTextInput";

export enum CanvasTools {
    TEXT = 1,
    DRAW = 2
}


interface Point {
    x: number,
    y: number
}

interface Line {
    color: string
    points: Point[]
    lineWidth: number
}

export interface SketchCanvas {
    render: JSX.Element,
    setLineWidth(lineWidth: number): void,
    setColor(color: string): void,
    setCurrentTool(tool: CanvasTools): void,
    submit(): void
}

export interface TextData {
    text: string,
    fontSize: number,
    pos: Point,
    color: string,
    new: boolean
}

const FONT_SIZE = 23;

export function useSketchCanvas(width: number, height: number, bannerHeight: number): SketchCanvas {
    const [lines, setLines] = useState<Line[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [lineWidth, setLineWidth] = useState(12);
    let [texts, setTexts] = useState<TextData[]>([]);
    let [currentTool, setCurrentTool] = useState(CanvasTools.TEXT);
    let [selectedText, setSelectedText] = useState<number>(-1)
    let [scale, setScale] = useState(1);
    const window = useWindowDimensions()


    useEffect(() => {
        let scale = (window.width - 20) / width;
        setScale(scale)
    }, [bannerHeight, window])


    const addText = (x: number, y: number) => {

        let newText = {
            text: '',
            fontSize: FONT_SIZE,
            pos: { x, y },
            color,
            new: true
        };
        setTexts(prevState => [...prevState, newText])
    }


    const submit = () => {

        // if (ctx && data) {
        //     console.log(data);
        //     ctx.fillStyle = 'white';
        //     ctx.strokeStyle = 'white'
        //     ctx.font = `${data.fontSize}px arial`;
        //     ctx.fillText(data.text, data.pos.x, data.fontSize + data.pos.y)
        // }

    }
    let startDraw = (x: number, y: number) => {
        setLines(prevState => [...prevState, { color, lineWidth, points: [{ x, y }] }])
        setDrawing(true)
    }

    let activeDraw = (x: number, y: number) => {
        if (!drawing)
            return
        x = Math.min(Math.max(0, x), width)
        y = Math.min(Math.max(0, y), height)
        setLines(prevState => {
            let line = prevState.pop()!;
            return [...prevState, { ...line, points: [...line?.points, { x, y }] }]
        })
    }

    let resetTextSelected = () => {
        // setSelectedText(-1)
    }
    let endDraw = () => {
        setDrawing(false);
    }



    let handlePanGesture = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        let { x, y } = nativeEvent;
        switch (nativeEvent.state) {
            case State.BEGAN:
                console.log('f');

                if (currentTool === CanvasTools.DRAW) {
                    startDraw(x, y)
                } else {

                }
                break;
            case State.ACTIVE:
                console.log('active');
                if (currentTool === CanvasTools.DRAW) {
                    activeDraw(x, y);
                } else if (selectedText != -1) {
                }
                break;
            case State.END:
                console.log('end');

                if (currentTool === CanvasTools.DRAW) {
                    setDrawing(false);
                } else if (selectedText != -1) {
                    setSelectedText(-1)
                } else {

                    addText(x, y)
                }
                break;
        }
    }



    let changeData = (removeText: boolean, index: number, newData?: TextData) => {
        if (!removeText && newData)
            return setTexts(prevState => {
                let newState = [...prevState];
                newState[index] = newData;
                return newState;
            })
        setTexts(prevState => {
            prevState.splice(index, 1)
            return [...prevState];
        })
    }


    let selectElement = (index: number) => setSelectedText(index);

    let canvas = {
        render: (
            <Animated.View style={{ transform: [{ scale }] }}>
                <PanGestureHandler maxPointers={1}
                    onHandlerStateChange={handlePanGesture}
                    onGestureEvent={handlePanGesture}
                >
                    <Animated.View>
                        <Svg
                            style={{
                                backgroundColor: 'black',
                                height: height,
                                width: width,
                            }}
                        >
                            {
                                lines.map((line, i) => <Path
                                    key={i}
                                    d={'M' + line.points.map(p => `${p.x} ${p.y}`).join(' L ')}
                                    strokeWidth={line.lineWidth}
                                    strokeLinecap="round"
                                    stroke={color}
                                />)
                            }
                        </Svg>
                    </Animated.View>
                </PanGestureHandler>
                {texts.map((textData, i) => <CanvasTextInput onSelected={selectElement} isDrawing={true} key={i} textData={textData} canvasWidth={width} index={i} changeData={changeData} canvasHeight={height} />)}
            </Animated.View>
        ),
        setLineWidth,
        setColor,
        setCurrentTool,
        submit
    }
    return canvas;
}