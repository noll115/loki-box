import { StyleSheet, TextInput } from 'react-native';
import Animated, {
    add,
    and,
    cond,
    eq,
    set,
    useValue,
    debug,
    call,
    multiply,
    lessThan,
    max,
    sub,
    min,
} from 'react-native-reanimated'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Canvas from 'react-native-canvas';
import {
    LongPressGestureHandler,
    PanGestureHandler,
    PinchGestureHandler,
    State,
} from 'react-native-gesture-handler';



const FONT_SIZE = 23

interface MsgProps {
    canvas: Canvas,

}

interface CanvasTextInput {
    getInputData(): {
        text: string,
        fontSize: number
    } & CanvasInputData
}

interface CanvasInputData {
    width: number,
    height: number,
    fontSize: number,
    pos: { x: number, y: number }
}

const AnimTextInput = Animated.createAnimatedComponent(TextInput);
const _CanvasTextInput: React.ForwardRefRenderFunction<CanvasTextInput, MsgProps> = ({ canvas }, ref) => {
    let [text, setText] = useState('');
    let textRef = useRef<any | null>(null);
    let [editable, setEditable] = useState(true);
    let pressGesRef = useRef<LongPressGestureHandler | null>(null);
    let panGesRef = useRef<PanGestureHandler | null>(null);
    let pinchGesRef = useRef<PinchGestureHandler | null>(null);
    let data = useRef<CanvasInputData>({
        width: FONT_SIZE,
        height: FONT_SIZE,
        fontSize: FONT_SIZE,
        pos: { x: (canvas.width / 2) - FONT_SIZE / 2, y: (canvas.height / 2) - FONT_SIZE / 2 }
    })
    let textWidth = useValue(0);
    let textHeight = useValue(0);

    let pinchScale = useValue(1);
    let baseScale = useValue(FONT_SIZE);
    let finalScale = Animated.multiply(pinchScale, baseScale);
    let heldLong = useValue(0);
    let dragX = useValue(0);
    let dragY = useValue(0);
    let offsetX = useValue(data.current.pos.x);
    let offsetY = useValue(data.current.pos.y);
    let gestureState = useValue(-1);

    useEffect(() => {
        if (editable && textRef.current) {
            textRef.current.getNode().focus()

        }
    }, [editable, textRef])


    useImperativeHandle(ref, () => ({
        getInputData: () => ({
            text,
            pos: data.current.pos,
            fontSize: data.current.fontSize,
            height: data.current.height,
            width: data.current.width
        })
    }))


    let enableEditable = () => {
        setEditable(true);
    }


    const longPressGestHandler = Animated.event([{
        nativeEvent: ({ state, numberOfPointers }: any) => cond(
            eq(state, State.ACTIVE),
            [
                debug('held', set(heldLong, 1)),
            ],
            cond(and(eq(state, State.FAILED), lessThan(numberOfPointers, 2)),
                [
                    call([], enableEditable)
                ]
            )
        )

    }], { useNativeDriver: true })

    let updatePos = ([x, y]: readonly number[]) => {
        data.current.pos = { x, y }
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
                                    debug('pre', add(offsetX, dragX)),
                                    set(offsetX, min(max(0, add(offsetX, dragX)), sub(canvas.width, textWidth))),
                                    set(offsetY, min(max(0, add(offsetY, dragY)), sub(canvas.height, textHeight))),
                                ]
                            ),
                            set(gestureState, 0),
                            debug('stop held', set(heldLong, 0)),
                            set(offsetX, min(max(0, offsetX), sub(canvas.width, textWidth))),
                            set(offsetY, min(max(0, offsetY), sub(canvas.height, textHeight))),
                            call([offsetX, offsetY], updatePos)
                        ]
                    )
                ),
            },
        },
    ]);

    let setScale = ([scale]: readonly number[]) => { data.current.fontSize = scale }

    let onPinchGest = Animated.event([{
        nativeEvent: ({ state, scale }: any) => cond(
            eq(state, State.ACTIVE),
            [
                set(pinchScale, scale)
            ],
            cond(
                eq(state, State.END),
                [
                    set(baseScale, multiply(pinchScale, baseScale)),
                    set(pinchScale, 1),
                    call([baseScale], setScale)
                ]
            )
        )
    }])

    let moveX = cond(
        eq(gestureState, State.ACTIVE),
        min(max(0, add(offsetX, dragX)), sub(canvas.width, textWidth)),
        offsetX
    );
    let moveY = cond(
        eq(gestureState, State.ACTIVE),
        min(max(0, add(offsetY, dragY)), sub(canvas.height, textHeight)),
        offsetY
    );

    let transX = debug('finalX', cond(
        eq(heldLong, new Animated.Value(1)),
        moveX,
        offsetX
    ));
    let transY = cond(
        eq(heldLong, new Animated.Value(1)),
        moveY,
        offsetY
    )


    return (
        <LongPressGestureHandler
            ref={pressGesRef}
            onHandlerStateChange={longPressGestHandler}
            minDurationMs={1000}
            maxDist={10}
            waitFor={pinchGesRef}
            enabled={!editable}
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
                        console.log('change');

                        textHeight.setValue(nativeEvent.layout.height as any);
                        textWidth.setValue(nativeEvent.layout.width as any);
                        data.current.width = nativeEvent.layout.width
                        data.current.height = nativeEvent.layout.height
                    }}
                    value={text}
                    textAlign='center'
                    editable={editable}
                    maxLength={15}
                    autoFocus
                    onBlur={(e: any) => setEditable(false)}
                    onEndEditing={(e: any) => setEditable(false)}
                    ref={textRef}
                    onChangeText={(e: any) => setText(e)}
                    style={{ color: 'white', fontSize: finalScale, maxWidth: canvas.width - 10, maxHeight: canvas.height - 10 }} />

                <PinchGestureHandler
                    ref={pinchGesRef}
                    waitFor={pressGesRef}
                    onGestureEvent={onPinchGest}
                    onHandlerStateChange={onPinchGest}
                    hitSlop={100}
                    enabled={!editable}
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
                    enabled={!editable}
                >
                    <Animated.View style={{ ...StyleSheet.absoluteFillObject }} />
                </PanGestureHandler >
            </Animated.View>
        </LongPressGestureHandler >
    )

}

const CanvasTextInput = forwardRef(_CanvasTextInput);
export default CanvasTextInput; 