import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text } from "react-native";
import { LongPressGestureHandler, PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import Animated, { and, block, Clock, cond, debug, Easing, eq, neq, or, set, startClock, stopClock, timing, useValue } from "react-native-reanimated";




function scaleAnim(clock: Clock, pressState: Animated.Value<number>) {
    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: new Animated.Value(3000),
        toValue: new Animated.Value(0),
        easing: Easing.inOut(Easing.ease),
    };
    return block([
        cond(
            and(eq(pressState, State.FAILED), neq(config.toValue, 0)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(config.duration, 100),
                set(state.frameTime, 0),
                set(config.toValue, 0),
                startClock(clock),
            ]
        ),
        cond(
            and(eq(pressState, State.BEGAN), neq(config.toValue, 0.5)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(config.duration, 3000),
                set(state.position, 0),
                set(state.frameTime, 0),
                set(config.toValue, 0.5),
                startClock(clock),
            ]
        ),
        cond(
            and(eq(pressState, State.ACTIVE), neq(config.toValue, 1)),
            [
                set(state.finished, 0),
                set(state.time, 0),
                set(config.duration, 1000),
                set(state.frameTime, 0),
                set(config.toValue, 1),
                startClock(clock),
            ]
        ),

        // we run the step here that is going to update position
        timing(clock, state, config),
        // if the animation is over we stop the clock
        cond(state.finished, stopClock(clock)),
        // we made the block return the updated position
        state.position,
    ]);

}





export const SubmitScreen: React.FC = () => {

    let animState = new Animated.Value(0);
    let clock = new Clock();
    let scale = scaleAnim(clock, animState);
    let pressHandler = Animated.event([
        {
            nativeEvent: {
                state: (state: any) =>
                    cond(
                        neq(animState, State.END),
                        debug('state', set(animState, state))
                    )
            }
        }
    ])

    return (
        <View style={{ width: '100%', backgroundColor: 'green', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 25 }}>Hold to send your message!</Text>
            </View>
            <LongPressGestureHandler
                minDurationMs={3000}
                onGestureEvent={pressHandler}
                onHandlerStateChange={pressHandler}
            >
                <Animated.View style={{ flex: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue' }}>
                    <Animated.View style={{
                        transform: [{
                            scale: Animated.interpolate(scale, {
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 2, 20]
                            })
                        }]
                    }}>
                        <AntDesign name="heart" style={[{ fontSize: 150 }]} color="#8C1C13" />
                    </Animated.View>
                </Animated.View>
            </LongPressGestureHandler>
        </View>
    )
}