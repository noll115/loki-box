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
    debug,
    block,
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
    changeData: (removeText: boolean, index: number, newData?: TextData) => void,
    onSelected: ((index: number) => void) | undefined
}
const MIN_FONT_SIZE = 23
const MAX_FONT_SIZE = 60


const AnimTextInput = Animated.createAnimatedComponent(TextInput);
const _CanvasTextInput: React.FC<MsgProps> = ({ textData, canvasHeight, canvasWidth, index, isDrawing, changeData, onSelected }) => {


    let [text, setText] = useState(textData.text);
    let textRef = useRef<any | null>(null);
    let [editable, setEditable] = useState(textData.new);
    let panGesRef = useRef<PanGestureHandler | null>(null);
    let pinchGesRef = useRef<PinchGestureHandler | null>(null);


    let textWidth = useValue(0);
    let textHeight = useValue(0);
    let pinchScale = useValue(1);
    let baseScale = useValue(textData.fontSize);
    let finalScale = min(max(Animated.multiply(pinchScale, baseScale), MIN_FONT_SIZE), MAX_FONT_SIZE);
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

    let updatePos = ([x, y]: readonly number[]) => {
        changeData(false, index, { ...textData, pos: { x, y } })
    }

    let onGesturePan = Animated.event([
        {
            nativeEvent: {
                translationX: dragX,
                translationY: dragY,
                state: (state: State) => block([
                    cond(
                        eq(state, State.BEGAN),
                        set(gestureState, State.BEGAN as number)
                    ),
                    cond(
                        eq(state, State.ACTIVE),
                        [
                            set(gestureState, State.ACTIVE as number),
                        ],
                    ),
                    cond(
                        eq(state, State.END),
                        [
                            cond(
                                eq(gestureState, State.ACTIVE),
                                [
                                    set(offsetX, min(max(0, add(offsetX, dragX)), sub(canvasWidth, textWidth))),
                                    set(offsetY, min(max(0, add(offsetY, dragY)), sub(canvasHeight, textHeight))),
                                    call([offsetX, offsetY], updatePos)
                                ]
                            ),
                            cond(
                                eq(gestureState, State.BEGAN),
                                call([], enableEditable)
                            ),
                            set(gestureState, 0),
                        ]
                    )

                ]),
            },
        },
    ]);

    let setScale = ([scale]: readonly number[]) => {
        changeData(false, index, { ...textData, fontSize: scale })
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


    let changeEdit = () => {
        setEditable(false);
        if (text !== '') {
            return changeData(false, index, { ...textData, text, new: false });
        }
        changeData(true, index);
    }

    let onTouchStart = onSelected ? () => onSelected(index) : undefined;

    console.log();

    return (

        <Animated.View style={{
            position: 'absolute',
            transform: [{
                translateX: moveX,
                translateY: moveY,
            }],
            backgroundColor: 'red'

        }}
            onTouchStart={onTouchStart}
        >
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
                onGestureEvent={onGesturePan}
                maxPointers={1}
            >
                <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
            </PanGestureHandler >
        </Animated.View>

    )

}

const CanvasTextInput = _CanvasTextInput;
export default CanvasTextInput; 