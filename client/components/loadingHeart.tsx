import { AntDesign } from "@expo/vector-icons";
import React, { useRef } from "react";
import Animated, { block, Clock, clockRunning, cond, debug, Easing, eq, interpolate, not, set, startClock, stopClock, timing, useValue } from "react-native-reanimated";


const scaleAnim = (clock: Clock) => {
    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: 1000,
        toValue: new Animated.Value(1),
        easing: Easing.inOut(Easing.ease),
    };

    return block([

        cond(
            clockRunning(clock), 0,
            [
                set(state.finished, 0),
                set(state.position, 0),
                set(state.time, 0),
                set(state.frameTime, 0),
                startClock(clock)
            ]
        ),
        timing(clock, state, config),
        cond(state.finished,
            block([
                cond(
                    eq(config.toValue, 0),
                    set(config.toValue, 1),
                    set(config.toValue, 0)
                ),
                set(state.finished, 0),
                set(state.frameTime, 0),
                set(state.time, 0),
            ])
        ),
        state.position,
    ])
}




export const LoadingHeart: React.FC = () => {
    const clock = new Clock();
    console.log('yo');
    
    const scale = scaleAnim(clock);
    return (
        <Animated.View style={{
            transform: [{
                scale: interpolate(scale, {
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                })
            }]
        }}>
            <AntDesign name="heart" size={100} color="#8C1C13" />
        </Animated.View>
    );
}