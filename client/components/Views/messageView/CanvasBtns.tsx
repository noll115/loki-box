import { TouchableOpacity, PanGestureHandlerGestureEvent, PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Rect } from 'react-native-svg';
import Animated, { and, block, call, Clock, cond, debug, divide, Easing, eq, interpolateColors, max, min, neq, set, startClock, stopClock, sub, timing, useValue, Value } from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from 'react'
import { StyleSheet, View, Text, Keyboard, KeyboardEventListener } from 'react-native';
import { SketchCanvas } from './SketchCanvas';


const Slider: React.FC<{ setColor(col: string): void }> = ({ setColor }) => {
    let height = useValue(30);
    let selectorOpacity = useValue(2);
    let stops = [];
    let inputs: number[] = [];
    let transY = useValue(-20);
    for (let i = 0; i <= 360; i += 360 / 6) {
        stops.push(`hsl(${i}, 100%, 50%)`)
        inputs.push(i / 360)
    }
    let color = interpolateColors(divide(transY, height), {
        inputRange: inputs,
        outputColorRange: stops,
    })
    let changeColor = ([col]: readonly number[]) => {
        setColor("#" + (col & 0x00FFFFFF).toString(16).padStart(6, '0'))
    }
    let panHandler = Animated.event([
        {
            nativeEvent: ({ state, y }: any) => block([
                set(transY, min(max(y, 0), height)),
                cond(eq(state, State.END),
                    call([color], changeColor)
                ),
                cond(eq(state, State.BEGAN),
                    set(selectorOpacity, 1)
                )
            ])
        },
    ]);
    return (
        <>
            <PanGestureHandler
                onGestureEvent={panHandler}
                onHandlerStateChange={panHandler}
            >
                <Animated.View
                    onLayout={e => height.setValue(e.nativeEvent.layout.height as any)}
                    style={canvasBtnStyle.slider}>
                    <LinearGradient
                        style={canvasBtnStyle.grad}
                        colors={stops}

                    />
                    <Animated.View style={[canvasBtnStyle.selector, { transform: [{ translateY: sub(transY, 25) }] }, {
                        opacity: selectorOpacity.interpolate({
                            inputRange: [0, 1, 2, 3],
                            outputRange: [0, 1, 0, 0]
                        })
                    }]} >
                        <View style={canvasBtnStyle.pointer} />
                        <Animated.View style={[canvasBtnStyle.selectorInner, { backgroundColor: color as any }]} />
                    </Animated.View>
                </Animated.View>
            </PanGestureHandler>
            <View
                style={{ width: 30, height: '10%', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}
            >
                <Svg
                    onPress={() => {
                        selectorOpacity.setValue(2 as any);
                        setColor('#FFFFFF')
                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <Rect height='100%' width='100%' fill='white' />

                </Svg>
                <Animated.View style={[canvasBtnStyle.selector, {
                    opacity: selectorOpacity.interpolate({
                        inputRange: [0, 1, 2, 3],
                        outputRange: [0, 0, 1, 0]
                    })
                }]}
                >
                    <View style={canvasBtnStyle.pointer} />
                    <Animated.View style={[canvasBtnStyle.selectorInner, { backgroundColor: 'white' }]} />
                </Animated.View>
            </View >
            <View
                style={{ width: 30, height: '10%', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}
            >
                <Svg
                    onPress={() => {
                        selectorOpacity.setValue(3 as any);
                        setColor('#000000')

                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <Rect height='100%' width='100%' fill='black' />

                </Svg>
                <Animated.View style={[canvasBtnStyle.selector, {
                    opacity: selectorOpacity.interpolate({
                        inputRange: [0, 1, 2, 3],
                        outputRange: [0, 0, 0, 1]
                    })
                }]}
                >
                    <View style={canvasBtnStyle.pointer} />
                    <Animated.View style={[canvasBtnStyle.selectorInner, { backgroundColor: 'black' }]} />
                </Animated.View>
            </View >
        </>
    )
}






interface canvasBtnProps {
    sketchCanvas: SketchCanvas
}

const keyBoardChange = (clock: Clock, keyboardState: Animated.Value<number>, height: Animated.Value<number>) => {
    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0),
    };

    const config = {
        duration: 250,
        toValue: new Value(0),
        easing: Easing.inOut(Easing.ease),
    };

    return block([
        cond(and(eq(keyboardState, 1), neq(config.toValue, 1)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(state.frameTime, 0),
                set(config.toValue, 1),
                startClock(clock)
            ]
        ),
        cond(and(eq(keyboardState, 0), neq(config.toValue, 0)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(state.frameTime, 0),
                set(config.toValue, 0),
                startClock(clock)
            ]
        ),
        timing(clock, state, config),
        cond(state.finished, stopClock(clock)),
        state.position.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height]
        })
    ])
}




export const Canvasbtns: React.FC<canvasBtnProps> = ({ sketchCanvas }) => {
    let clock = new Clock();
    let keyboardState = useValue<number>(0);
    let keyboardDuration = useValue<number>(0);
    let endHeight = useValue<number>(0);
    let height = keyBoardChange(clock, keyboardState, endHeight);

    useEffect(() => {
        let willShowUnsub = Keyboard.addListener('keyboardDidShow', keyBoardShows);
        let willHideUnsub = Keyboard.addListener('keyboardDidHide', keyboardHide);

        return () => {
            willShowUnsub.remove();
            willHideUnsub.remove();
        }
    }, [])

    let keyBoardShows: KeyboardEventListener = ({ duration, endCoordinates }) => {
        keyboardDuration.setValue(duration);
        endHeight.setValue(-endCoordinates.height)
        keyboardState.setValue(1);
        console.log(duration, endCoordinates.screenY);

    }

    let keyboardHide: KeyboardEventListener = (event) => {
        console.log(event.endCoordinates.height);
        keyboardState.setValue(0);
    }


    return (
        <View
            style={canvasBtnStyle.container}>
            <Animated.View style={{ flexDirection: 'row', position: 'absolute', bottom: 0, transform: [{ translateY: height }] }}>
                <TouchableOpacity style={canvasBtnStyle.modeBtn} >
                    <Text>Add Text</Text>
                </TouchableOpacity>
                <TouchableOpacity style={canvasBtnStyle.modeBtn} >
                    <Text>Draw</Text>
                </TouchableOpacity>
            </Animated.View>

        </View>
    )
}

const canvasBtnStyle = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: "green",
    },
    modeBtn: {
        width: 70,
        height: 70,
        backgroundColor: 'red',
        borderRadius: 10
    },
    slider: {
        width: 30,
        height: '50%'
    },
    grad: {
        height: '100%',
        width: '100%'
    },
    selector: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: -60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        borderRadius: 25
    },
    selectorInner: {
        width: '90%',
        height: '90%',
        borderRadius: 25
    },
    pointer: {
        position: 'absolute',
        width: 20,
        height: 20,
        transform: [{ translateX: 19 }, { rotateZ: '45deg' }],
        backgroundColor: 'grey'
    }
})