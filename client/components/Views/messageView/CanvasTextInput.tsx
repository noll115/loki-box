import { StyleSheet, TextInput } from 'react-native';
import Animated, {
    add,
    cond,
    eq,
    set,
    useValue,
    call,
    max,
    sub,
    min,
    block,
} from 'react-native-reanimated'
import React, { useEffect, useRef, useState } from 'react'
import {
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';
import { ReducerActions, CanvasActions, TextData } from "./../../../types/sketchCanvas";






interface MsgProps {
    textData: TextData,
    canvasWidth: number,
    canvasHeight: number,
    index: number,
    sketchDispatch: React.Dispatch<ReducerActions>,

}

const _CanvasTextInput: React.FC<MsgProps> = ({ textData, canvasHeight, canvasWidth, index, sketchDispatch }) => {


    let textRef = useRef<any | null>(null);
    let [editable, setEditable] = useState(true);

    let textWidth = useValue(0);
    let textHeight = useValue(0);
    let dragX = useValue(0);
    let dragY = useValue(0);
    let offsetX = useValue(textData.pos.x);
    let offsetY = useValue(textData.pos.y);
    let gestureState = useValue(-1);
    let textDataRef = useRef<TextData>(textData);


    useEffect(() => {
        if (editable && textRef.current) {
            textRef.current.focus()
        }
    }, [editable, textRef])
    useEffect(() => {
        textDataRef.current = textData;
    }, [textData])

    let enableEditable = () => {
        setEditable(true);
    }

    let updatePos = ([x, y]: readonly number[]) => {
        sketchDispatch({ type: CanvasActions.CHANGE_TEXT, index, newTextData: { ...textDataRef.current, pos: { x, y } } })
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
        if (textDataRef.current.text === '') {
            return sketchDispatch({ type: CanvasActions.REMOVE_TEXT, index });
        }

        sketchDispatch({ type: CanvasActions.CHANGE_TEXT, index, newTextData: { ...textDataRef.current } })
    }


    let changeText = (text: string) => {
        sketchDispatch({ type: CanvasActions.CHANGE_TEXT, index, newTextData: { ...textDataRef.current, text } })
    }

    return (

        <Animated.View style={{
            position: 'absolute',
            transform: [{
                translateX: moveX,
                translateY: moveY,
            }],
        }}
        >
            <TextInput
                onLayout={({ nativeEvent }: any) => {
                    let width = nativeEvent.layout.width;
                    let height = nativeEvent.layout.height;
                    textHeight.setValue(height);
                    textWidth.setValue(width);
                }}

                value={textData.text}
                textAlign='center'
                editable={editable}
                maxLength={15}
                onBlur={changeEdit}
                onEndEditing={changeEdit}
                ref={textRef}
                onChangeText={changeText}
                style={[style.text, {
                    color: textData.color,
                    fontSize: textData.fontSize,
                    maxWidth: canvasWidth - 10,
                    maxHeight: canvasHeight - 10
                }]} />
            <PanGestureHandler
                onHandlerStateChange={onGesturePan}
                onGestureEvent={onGesturePan}
                maxPointers={1}
            >
                <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
            </PanGestureHandler >
        </Animated.View>

    )

}

let style = StyleSheet.create({
    text: {
        textAlignVertical: 'top',
        textAlign: 'left',
    }
})

const CanvasTextInput = _CanvasTextInput;
export default CanvasTextInput; 