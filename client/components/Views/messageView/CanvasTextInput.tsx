import { StyleSheet, TextInput } from 'react-native';
import Animated, {
    add,
    and,
    cond,
    eq,
    set,
    useValue,
    call,
    lessThan,
    max,
    sub,
    min,
} from 'react-native-reanimated'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
    LongPressGestureHandler,
    PanGestureHandler,
    PinchGestureHandler,
    State,
} from 'react-native-gesture-handler';

import { TextData } from "./SketchCanvas";





interface MsgProps {
    textData: TextData,
    canvasWidth: number,
    canvasHeight: number,
    index: number,
    isDrawing: boolean,
    changeData: (newData: TextData, index: number) => void
}
const MIN_FONT_SIZE = 23
const MAX_FONT_SIZE = 60


const AnimTextInput = Animated.createAnimatedComponent(TextInput);
const _CanvasTextInput: React.FC<MsgProps> = ({ textData, canvasHeight, canvasWidth, index, isDrawing, changeData }) => {


    let [text, setText] = useState(textData.text);
    let textRef = useRef<any | null>(null);
    let [editable, setEditable] = useState(textData.new);
    let pressGesRef = useRef<LongPressGestureHandler | null>(null);
    let panGesRef = useRef<PanGestureHandler | null>(null);
    let pinchGesRef = useRef<PinchGestureHandler | null>(null);


    let textWidth = useValue(0);
    let textHeight = useValue(0);

    let pinchScale = useValue(1);
    let baseScale = useValue(textData.fontSize);
    let finalScale = min(max(Animated.multiply(pinchScale, baseScale), MIN_FONT_SIZE), MAX_FONT_SIZE);
    let heldLong = useValue(0);
    let dragX = useValue(0);
    let dragY = useValue(0);
    let offsetX = useValue(textData.pos.x);
    let offsetY = useValue(textData.pos.y);
    let gestureState = useValue(-1);


    useEffect(() => {
        if (editable && textRef.current) {
            textRef.current.getNode().focus()
        }
    }, [editable, textRef])


    let enableEditable = () => {
        setEditable(true);
    }


    const longPressGestHandler = Animated.event([{
        nativeEvent: ({ state, numberOfPointers }: any) => cond(
            eq(state, State.ACTIVE),
            [
                set(heldLong, 1),
            ],
            cond(and(eq(state, State.FAILED), lessThan(numberOfPointers, 2)),
                [
                    call([], enableEditable)
                ]
            )
        )

    }])

    let updatePos = ([x, y]: readonly number[]) => {
        changeData({ ...textData, pos: { x, y } }, index)
    }

    let onGesturePan = Animated.event([
        {
            nativeEvent: {
                translationX: dragX,
                translationY: dragY,
                state: (state: State) => cond(
                    and(eq(state, State.ACTIVE), heldLong),
                    set(gestureState, State.ACTIVE as number),
                    cond(eq(state, State.END),
                        [
                            cond(
                                eq(gestureState, State.ACTIVE),
                                [
                                    set(offsetX, min(max(0, add(offsetX, dragX)), sub(canvasWidth, textWidth))),
                                    set(offsetY, min(max(0, add(offsetY, dragY)), sub(canvasHeight, textHeight))),
                                ]
                            ),
                            set(gestureState, 0),
                            set(heldLong, 0),
                            set(offsetX, min(max(0, offsetX), sub(canvasWidth, textWidth))),
                            set(offsetY, min(max(0, offsetY), sub(canvasHeight, textHeight))),
                            call([offsetX, offsetY], updatePos)
                        ]
                    )
                ),
            },
        },
    ]);

    let setScale = ([scale]: readonly number[]) => {
        changeData({ ...textData, fontSize: scale }, index)
    }

    let onPinchGest = Animated.event([{
        nativeEvent: ({ state, scale }: any) => cond(
            eq(state, State.ACTIVE),
            [
                set(pinchScale, scale)
            ],
            cond(
                eq(state, State.END),
                [
                    set(baseScale, finalScale),
                    set(pinchScale, 1),
                    call([baseScale], setScale)
                ]
            )
        )
    }])

    let moveX = cond(
        eq(gestureState, State.ACTIVE),
        min(max(0, add(offsetX, dragX)), sub(canvasWidth, textWidth)),
        offsetX
    );
    let moveY = cond(
        eq(gestureState, State.ACTIVE),
        min(max(0, add(offsetY, dragY)), sub(canvasHeight, textHeight)),
        offsetY
    );

    let transX = cond(
        eq(heldLong, 1),
        moveX,
        offsetX
    );
    let transY = cond(
        eq(heldLong, 1),
        moveY,
        offsetY
    )
    let changeEdit = () => {
        setEditable(false);
        changeData({ ...textData, text, new: false }, index);
    }
    return (
        <LongPressGestureHandler
            ref={pressGesRef}
            onHandlerStateChange={longPressGestHandler}
            minDurationMs={1000}
            maxDist={10}
            waitFor={pinchGesRef}
            enabled={!editable && !isDrawing}
        >
            <Animated.View style={{
                position: 'absolute',

                transform: [{
                    translateX: transX,
                    translateY: transY,
                }]
            }}>
                <Animated.View style={{ backgroundColor: 'grey', opacity: heldLong, ...StyleSheet.absoluteFillObject }} />
                {editable && <Animated.View style={{ backgroundColor: 'grey', ...StyleSheet.absoluteFillObject }} />}
                <AnimTextInput
                    onLayout={({ nativeEvent }: any) => {
                        let width = nativeEvent.layout.width;
                        let height = nativeEvent.layout.height;
                        textHeight.setValue(height);
                        textWidth.setValue(width);
                    }}

                    value={text}
                    textAlign='center'
                    editable={editable}
                    maxLength={15}
                    autoFocus
                    onBlur={changeEdit}
                    onEndEditing={changeEdit}
                    ref={textRef}
                    onChangeText={(e: any) => setText(e)}
                    style={{ color: (editable ? 'black' : textData.color), fontSize: finalScale, maxWidth: canvasWidth - 10, maxHeight: canvasHeight - 10 }} />

                <PinchGestureHandler
                    ref={pinchGesRef}
                    waitFor={pressGesRef}
                    onGestureEvent={onPinchGest}
                    onHandlerStateChange={onPinchGest}
                    hitSlop={100}
                    enabled={!editable && !isDrawing}
                >
                    <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
                </PinchGestureHandler>
                <PanGestureHandler
                    ref={panGesRef}
                    onHandlerStateChange={onGesturePan}
                    simultaneousHandlers={[pressGesRef]}
                    onGestureEvent={onGesturePan}
                    waitFor={pressGesRef}
                    maxPointers={1}
                    enabled={!editable && !isDrawing}
                >
                    <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
                </PanGestureHandler >
            </Animated.View>
        </LongPressGestureHandler >
    )

}

const CanvasTextInput = _CanvasTextInput;
export default CanvasTextInput; 