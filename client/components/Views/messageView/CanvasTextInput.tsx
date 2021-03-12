import { PixelRatio, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
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
    enabled: boolean
}

const _CanvasTextInput: React.FC<MsgProps> = ({ textData, canvasHeight, canvasWidth, index, sketchDispatch, enabled }) => {


    let textRef = useRef<any | null>(null);
    let [editable, setEditable] = useState(true);

    let textWidth = useValue(0);
    let textHeight = useValue(0);
    let dragX = useValue(0);
    let dragY = useValue(0);
    let offsetX = useValue(textData.pos[0]);
    let offsetY = useValue(textData.pos[1]);
    let [pos, setPos] = useState([textData.pos[0], textData.pos[1]]);
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
        sketchDispatch({ type: CanvasActions.EDITING_TEXT, isEditingText: true });
    }

    let updatePos = ([x, y]: readonly number[]) => {
        setPos([x, y]);
        sketchDispatch({ type: CanvasActions.CHANGE_TEXT, index, newTextData: { ...textDataRef.current, pos: [x, y] } })
    }

    let onGesturePan = Animated.event([
        {
            nativeEvent: {
                translationX: dragX,
                translationY: dragY,
                state: (state: State) => block([
                    cond(eq(state, State.UNDETERMINED),
                        [
                            set(offsetX, min(max(0, add(offsetX, dragX)), sub(canvasWidth, textWidth))),
                            set(offsetY, min(max(0, add(offsetY, dragY)), sub(canvasHeight, textHeight))),
                            call([offsetX, offsetY], updatePos)
                        ]
                    ),
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

    let onEndEditing = () => {
        if (textDataRef.current.text === '') {
            sketchDispatch({ type: CanvasActions.REMOVE_TEXT, index });
        }
        setEditable(false);
        sketchDispatch({ type: CanvasActions.EDITING_TEXT, isEditingText: false });
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
                editable={editable}
                maxLength={15}
                onEndEditing={onEndEditing}
                ref={textRef}
                onChangeText={changeText}
                keyboardType='email-address'
                allowFontScaling={false}
                style={[style.text, {
                    color: textData.color,
                    fontSize: textData.txtSize,
                    maxWidth: canvasWidth - pos[0],
                    lineHeight: textData.txtSize,
                    height: textData.txtSize + 2,
                }]} />
            <PanGestureHandler
                onHandlerStateChange={onGesturePan}
                onGestureEvent={onGesturePan}
                maxPointers={1}
                enabled={enabled}
            >
                <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
            </PanGestureHandler >
        </Animated.View>

    )

}

let style = StyleSheet.create({
    text: {
        // textAlign: 'left',
        fontFamily: 'FreeSans'
    }
})

const CanvasTextInput = _CanvasTextInput;
export default CanvasTextInput;