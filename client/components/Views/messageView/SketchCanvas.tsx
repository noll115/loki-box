import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, useWindowDimensions, View } from "react-native";
import Canvas from "react-native-canvas";
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
    DISABLED,
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

export interface SketchCanvas {
    render: JSX.Element,
    currentTool: CanvasTools,
    lineWidth: number,
    clearCanvas(): void,
    disableCanvas(): void,
    enableCanvas(): void,
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
    let canvasRef = useRef<Canvas>(null);
    const window = useWindowDimensions()
    let canvasDisabled = canvasState === CanvasState.DISABLED;
    let inPreSubmit = canvasState === CanvasState.PRE_SUBMIT;


    useEffect(() => {
        let scale = (window.width - 20) / width;
        setScale(scale)
    }, [bannerHeight, window])


    useEffect(() => {
        // let data = JSON.stringify({
        //     texts,
        //     lines
        // });

        // console.log(data);
        // console.log(data.length);
        if (canvasState === CanvasState.PRE_SUBMIT && canvasRef.current) {
            let canvas = canvasRef.current;
            let ctx = canvas.getContext('2d');
            console.log(canvas);
            canvas.width = width;
            canvas.height = height;
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, width, height);
                texts.forEach(textData => {
                    ctx.fillStyle = textData.color;
                    ctx.font = `${textData.fontSize}px Arial`;
                    ctx.fillText(textData.text, textData.pos.x, textData.pos.y + textData.fontSize);
                });
                lines.forEach(line => {
                    ctx.strokeStyle = line.color;
                    ctx.lineWidth = line.lineWidth;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    let firstPoint = line.points[0];
                    ctx.moveTo(firstPoint.x, firstPoint.y);
                    for (let i = 1; i < line.points.length; i++) {
                        const point = line.points[i];
                        ctx.lineTo(point.x, point.y);
                    }
                    ctx.stroke();
                });
                canvas.toDataURL().then(data => {

                })
            }
        }
    }, [canvasState])


    const addText = (x: number, y: number) => {

        let newText = {
            text: '',
            fontSize: lineWidth,
            pos: { x, y },
            color,
            new: true
        };
        setTexts(prevState => [...prevState, newText])
    }




    const submit = () => {
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
    let paths = useMemo(() => lines.map((line, i) => <Path
        key={i}
        d={'M' + line.points.map(p => `${p.x} ${p.y}`).join(' L ')}
        strokeWidth={line.lineWidth}
        strokeLinecap="round"
        stroke={line.color}
    />), [lines])

    let selectElement = (index: number) => setSelectedText(index);
    let clearCanvas = () => {
        setTexts([]);
        setLines([]);
    };

    let disableCanvas = () => {
        setCanvasState(CanvasState.DISABLED);
    }
    let enableCanvas = () => {
        setCanvasState(CanvasState.EDITING)
    }
    let canvas: SketchCanvas = {
        render: (
            <>
                <Animated.View style={{ transform: [{ scale }] }}>


                    <PanGestureHandler maxPointers={1}
                        onHandlerStateChange={canvasDisabled ? undefined : handlePanGesture}
                        onGestureEvent={canvasDisabled ? undefined : handlePanGesture}
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
                                {inPreSubmit && texts.map((textData, i) => <Text x={textData.pos.x} y={textData.fontSize + textData.pos.y} fontSize={textData.fontSize} key={i} fill={textData.color} >{textData.Text}</Text>)}
                            </Svg>
                        </Animated.View>
                    </PanGestureHandler>
                    {!inPreSubmit && texts.map((textData, i) => <CanvasTextInput onSelected={canvasDisabled ? undefined : selectElement} key={i} textData={textData} canvasWidth={width} index={i} changeData={changeData} canvasHeight={height} />)}
                    {inPreSubmit && <Canvas style={{ width: width, height: height, position: 'absolute', bottom: 0, backgroundColor: 'red' }} ref={canvasRef} />}
                </Animated.View >
            </>
        ),
        currentTool,
        lineWidth,
        disableCanvas,
        enableCanvas,
        clearCanvas,
        setLineWidth,
        setColor,
        setCurrentTool,
        submit
    }
    return canvas;
}