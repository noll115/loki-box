import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, block, Clock, timing, eq, startClock, cond, stopClock } from 'react-native-reanimated';

function ShowAnim(clock: Clock) {

    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: new Animated.Value(1000),
        toValue: new Animated.Value(1),
        easing: Easing.inOut(Easing.ease),
    };


    return block([
        cond(
            eq(state.position, 0),
            startClock(clock)
        ),
        timing(clock, state, config),
        cond(state.finished, stopClock(clock)),
        state.position
    ])
}



export const SubmittedScreen: React.FC<{ onPress(): void }> = ({ onPress }) => {
    let clock = new Clock();
    let showVal = ShowAnim(clock)

    return (
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#C5261B', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View style={{ height: '50%' }}>
                <Animated.View style={[style.textContainer, {
                    opacity: showVal, transform: [{
                        translateY: Animated.interpolate(showVal, {
                            inputRange: [0, 1],
                            outputRange: [100, 0]
                        })
                    }]
                }]}>
                    <Text style={style.text}>Your message was sent!</Text>
                </Animated.View>
                <Animated.View style={[style.btnContainer, {
                    transform: [{
                        translateY: Animated.interpolate(showVal, {
                            inputRange: [0, 0.5, 1],
                            outputRange: [100, 100, 0]
                        })
                    }],
                    opacity: Animated.interpolate(showVal, {
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0, 1]
                    })
                }]}>
                    <TouchableOpacity style={style.btn} onPress={onPress}>
                        <Ionicons name="checkmark" size={80} color="#FAECBC" />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const style = StyleSheet.create({
    btn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D4668E'
    },
    btnContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 25,
        color: '#FAECBC'
    },
    textContainer: {
        flex: 4,
        justifyContent: 'center'
    }
})