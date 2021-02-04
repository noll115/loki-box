import React, { useCallback, useEffect, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, useWindowDimensions } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Svg, { Path, Text } from 'react-native-svg'
import CanvasTextInput from "./CanvasTextInput";
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
    new: boolean
}

const FONT_SIZE = 23;

export function useSketchCanvas(width: number, height: number, bannerHeight: number) {
    const [lines, setLines] = useState<Line[]>([]);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [lineWidth, setLineWidth] = useState(12);
    let [texts, setTexts] = useState<TextData[]>([]);
    let [scale, setScale] = useState(1);
    const window = useWindowDimensions()

    useEffect(() => {
        let scale = (window.height - bannerHeight * 1.5) / height;
        setScale(scale)
    }, [bannerHeight, window])


    const addText = () => {
        let newText = {
            text: '',
            fontSize: FONT_SIZE,
            pos: {
                x: width / 2 - FONT_SIZE,
                y: height / 2 - FONT_SIZE
            },
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

    let handlePanGesture = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        let { x, y } = nativeEvent
        switch (nativeEvent.state) {
            case State.BEGAN:
                setLines(prevState => [...prevState, { color, lineWidth, points: [{ x, y }] }])
                setDrawing(true)
                break;
            case State.ACTIVE:
                if (!drawing)
                    return
                x = Math.min(Math.max(0, x), width)
                y = Math.min(Math.max(0, y), height)
                setLines(prevState => {
                    let line = prevState.pop()!;
                    return [...prevState, { ...line, points: [...line?.points, { x, y }] }]
                })
                break;
            case State.END:
                setDrawing(false);
                break;
        }
    }

    let changeData = (newData: TextData, index: number) => {
        setTexts(prevState => {
            let newState = [...prevState];
            newState[index] = newData;
            return newState;
        })
    }

    let canvas = {
        render: (
            <PanGestureHandler maxPointers={1}
                onHandlerStateChange={handlePanGesture}
                onGestureEvent={handlePanGesture}
            >
                <Svg
                    style={{
                        backgroundColor: 'black',
                        height: height,
                        width: width,
                        transform: [{ scale }]
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
                    {texts.map((textData, i) => <CanvasTextInput isDrawing={true} key={i} textData={textData} canvasWidth={width} index={i} changeData={changeData} canvasHeight={height} />
                    )}
                </Svg>
            </PanGestureHandler>
        ),
        setLineWidth,
        setColor,
        addText,
        submit
    }
    return canvas;
}