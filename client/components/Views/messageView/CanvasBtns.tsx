import { TouchableOpacity, PanGestureHandlerGestureEvent, PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Rect } from 'react-native-svg';
import Animated, { and, block, call, Clock, cond, debug, divide, Easing, eq, interpolateColors, max, min, neq, onChange, set, startClock, stopClock, sub, timing, useValue, Value } from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from 'react'
import { StyleSheet, View, Text, Keyboard, KeyboardEventListener } from 'react-native';
import { SketchCanvas } from './SketchCanvas';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


const Slider: React.FC<{ setColor(col: string): void }> = ({ setColor }) => {
    let width = useValue<number>(30);
    let selectorOpacity = useValue(2);
    let stops = [];
    let inputs: number[] = [];
    let transX = useValue(0);
    for (let i = 0; i <= 360; i += 360 / 6) {
        stops.push(`hsl(${i}, 100%, 50%)`)
        inputs.push(i / 360)
    }
    let color = interpolateColors(divide(transX, width), {
        inputRange: inputs,
        outputColorRange: stops,
    })
    let changeColor = ([col]: readonly number[]) => {
        setColor("#" + (col & 0x00FFFFFF).toString(16).padStart(6, '0'))
    }
    let panHandler = Animated.event([
        {
            nativeEvent: ({ state, x }: any) => block([
                set(transX, min(max(x, 0), width)),
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
        <Animated.View >
            <PanGestureHandler
                onGestureEvent={panHandler}
                onHandlerStateChange={panHandler}
            >
                <Animated.View
                    onLayout={e => width.setValue(e.nativeEvent.layout.width)}
                    style={canvasBtnStyle.slider}>
                    <LinearGradient
                        style={canvasBtnStyle.grad}
                        colors={stops}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    <Animated.View style={[canvasBtnStyle.selector, { transform: [{ translateX: debug('x', transX) }] }, {
                        opacity: selectorOpacity.interpolate({
                            inputRange: [0, 1, 2, 3],
                            outputRange: [0, 1, 0, 0]
                        })
                    }]} >
                        <Animated.View style={[canvasBtnStyle.selectorInner, { backgroundColor: color as any }]} />
                    </Animated.View>
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
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
        duration: 100,
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
            <Animated.View style={{ flexDirection: 'row', position: 'absolute', bottom: 0, transform: [{ translateY: height }], width: '100%', paddingVertical: 10 }}>
                <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <TouchableOpacity style={canvasBtnStyle.modeBtn} >
                        <Ionicons name="ios-enter-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={canvasBtnStyle.modeBtn} >
                        <MaterialCommunityIcons name="text-box-plus-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={canvasBtnStyle.modeBtn} >
                        <MaterialCommunityIcons name="draw" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2 }}>
                    <Slider setColor={sketchCanvas.setColor} />
                </View>
            </Animated.View>

        </View>
    )
}

const canvasBtnStyle = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    modeBtn: {
        width: 50,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    slider: {
        margin: 10,
        justifyContent: 'center'
    },
    grad: {
        height: '100%',
        width: '100%',
        borderRadius: 20
    },
    selector: {
        width: 40,
        height: 40,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        borderRadius: 20,
        left: -20
    },
    selectorInner: {
        width: '90%',
        height: '90%',
        borderRadius: 25
    }
})