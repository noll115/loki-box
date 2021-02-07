import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Path, Text, Svg } from 'react-native-svg'
import CanvasTextInput from "./CanvasTextInput";
export enum CanvasTools {
    TEXT,
    DRAW,
}

export enum CanvasState {
    EDITING,
    PRE_SUBMIT
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

export interface TextData {
    text: string,
    fontSize: number,
    pos: Point,
    color: string,
}

export interface SketchCanvas {
    render: JSX.Element,
    currentTool: CanvasTools,
    lineWidth: number,
    canvasState: CanvasState,
    clearCanvas(): void,
    enableCanvas(): void,
    setLineWidth(lineWidth: number): void,
    setColor(color: string): void,
    setCurrentTool(tool: CanvasTools): void,
    preSubmit(): void
}



export function useSketchCanvas(width: number, height: number, bannerHeight: number): SketchCanvas {
    const [lines, setLines] = useState<Line[]>([]);
    const [currentLine, setCurrentLine] = useState<Line | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [lineWidth, setLineWidth] = useState(12);
    let [texts, setTexts] = useState<TextData[]>([]);
    let [currentTool, setCurrentTool] = useState(CanvasTools.TEXT);
    let [selectedText, setSelectedText] = useState<number>(-1)
    let [scale, setScale] = useState(1);
    let [canvasState, setCanvasState] = useState(CanvasState.EDITING);
    let svgRef = useRef<any>(null);
    const window = useWindowDimensions()
    let inPreSubmit = canvasState === CanvasState.PRE_SUBMIT;


    useEffect(() => {
        let scale = (window.width - 20) / width;
        setScale(scale)
    }, [bannerHeight, window])


    useEffect(() => {
        if (canvasState === CanvasState.PRE_SUBMIT) {
            let string = JSON.stringify({ texts, lines })
            console.log('json', string.length)
        }
    }, [canvasState])


    const addText = (x: number, y: number) => {

        let newText = {
            text: '',
            fontSize: lineWidth,
            pos: { x, y },
            color
        };
        setTexts(prevState => [...prevState, newText])
    }




    const preSubmit = () => {
        setCanvasState(CanvasState.PRE_SUBMIT);
    }
    let startDraw = (x: number, y: number) => {
        let newLine = {
            color,
            lineWidth,
            points: [{ x, y }]
        }
        setCurrentLine(newLine);
        setDrawing(true)
    }
    let activeDraw = (x: number, y: number) => {
        if (!drawing)
            return
        x = Math.min(Math.max(0, x), width)
        y = Math.min(Math.max(0, y), height)
        setCurrentLine(prevState => {
            if (prevState)
                return { ...prevState, points: [...prevState.points, { x, y }] }
            return null
        })
    }

    let endDraw = () => {
        setDrawing(false);
        if (currentLine) {
            setLines(prevState => [...prevState, currentLine])
            setCurrentLine(null);
        }
    }



    let handlePanGesture = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        let { x, y } = nativeEvent;
        x = Math.round(x);
        y = Math.round(y);
        switch (nativeEvent.state) {
            case State.BEGAN:
                if (currentTool === CanvasTools.DRAW) {
                    startDraw(x, y)
                } else {

                }
                break;
            case State.ACTIVE:
                if (currentTool === CanvasTools.DRAW) {
                    activeDraw(x, y);
                } else if (selectedText != -1) {
                }
                break;
            case State.END:
                if (currentTool === CanvasTools.DRAW) {
                    endDraw();
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
    let paths = useMemo(() => {
        console.log('ran')
        return lines.map((line, i) => <Path
            key={i}
            d={'M' + line.points.map(p => `${p.x} ${p.y}`).join(' L ')}
            strokeWidth={line.lineWidth}
            strokeLinecap="round"
            stroke={line.color}
        />)
    }, [lines])

    let selectElement = (index: number) => setSelectedText(index);
    let clearCanvas = () => {
        setTexts([]);
        setLines([]);
    };

    let enableCanvas = () => {
        setCanvasState(CanvasState.EDITING)
    }
    let canvas: SketchCanvas = {
        render: (
            <Animated.View style={{ transform: [{ scale }] }}>


                <PanGestureHandler maxPointers={1}
                    onHandlerStateChange={inPreSubmit ? undefined : handlePanGesture}
                    onGestureEvent={inPreSubmit ? undefined : handlePanGesture}
                >
                    <Animated.View>
                        <Svg
                            style={{
                                backgroundColor: 'black',
                                height: height,
                                width: width,
                            }}
                            ref={svgRef}
                        >
                            {paths}
                            {currentLine &&
                                <Path
                                    d={'M' + currentLine.points.map(p => `${p.x} ${p.y}`).join(' L ')}
                                    strokeWidth={currentLine.lineWidth}
                                    strokeLinecap="round"
                                    stroke={currentLine.color}
                                />}
                            {inPreSubmit && texts.map((textData, i) =>
                                <Text
                                    x={textData.pos.x}
                                    y={textData.fontSize + textData.pos.y}
                                    fontSize={textData.fontSize}
                                    key={i} fill={textData.color} >{textData.text}
                                </Text>)
                            }
                        </Svg>
                    </Animated.View>
                </PanGestureHandler>
                {!inPreSubmit && texts.map((textData, i) => <CanvasTextInput onSelected={selectElement} key={i} textData={textData} canvasWidth={width} index={i} changeData={changeData} canvasHeight={height} />)}
            </Animated.View >
        ),
        canvasState,
        currentTool,
        lineWidth,
        enableCanvas,
        clearCanvas,
        setLineWidth,
        setColor,
        setCurrentTool,
        preSubmit
    }
    return canvas;
}