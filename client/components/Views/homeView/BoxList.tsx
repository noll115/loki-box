import { AntDesign } from "@expo/vector-icons"
import React, { FC, useEffect } from "react"
import { Text } from "react-native"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import Animated, { and, block, call, Clock, cond, EasingNode, eq, neq, not, set, startClock, stopClock, timing, useSharedValue, useValue } from "react-native-reanimated"
import { SelectBox, useAppDispatch, useAppSelector } from "../../../redux"


function fadeAnim(clock: Clock, shouldFade: Animated.Value<0 | 1>, closeBoxList: () => void) {
    const state = {
        finished: new Animated.Value(0),
        position: new Animated.Value(0),
        time: new Animated.Value(0),
        frameTime: new Animated.Value(0),
    };

    const config = {
        duration: 250,
        toValue: new Animated.Value(0),
        easing: EasingNode.inOut(EasingNode.ease),
    };

    return block([
        cond(
            and(eq(shouldFade, 1), neq(config.toValue, 1)),
            [
                set(config.toValue, 1),
                set(state.finished, 0),
                set(state.time, 0),
                set(state.frameTime, 0),
                startClock(clock)
            ]
        ),
        cond(
            and(eq(shouldFade, 0), neq(config.toValue, 0)),
            [
                set(config.toValue, 0),
                set(state.finished, 0),
                set(state.time, 0),
                set(state.frameTime, 0),
                startClock(clock)
            ]
        ),
        timing(clock, state, config),
        cond(state.finished,
            [
                stopClock(clock),
                cond(
                    not(config.toValue),
                    call([], closeBoxList)
                )
            ],
        ),
        state.position
    ])
}

type Props = {
    boxListOpen: boolean,
    hideBoxList: () => void
}

export const BoxList: FC<Props> = ({ boxListOpen, hideBoxList }) => {

    const { boxes, selectedBox } = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const shouldFade = useValue<0 | 1>(0);

    useEffect(() => {
        if (boxListOpen)
            shouldFade.setValue(0);
    }, [boxListOpen]);


    const clock = new Clock();

    if (!boxListOpen)
        return null;

    const fadeAnimation = fadeAnim(clock, shouldFade, hideBoxList);

    let menuItems = boxes!.filter(box => box.boxID !== selectedBox?.boxID).map((box, index) => {
        let isFirst = index === 0;
        if (box.boxID === selectedBox?.boxID) {
            return null;
        }
        console.log(isFirst, index)
        let selectBox = () => {
            shouldFade.setValue(0);
            dispatch(SelectBox(box))
        };
        return (
            <View key={index} style={!isFirst && styles.linedBox}>
                <Pressable
                    style={styles.boxMenuItems}
                    onPress={selectBox}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize' }}>{box.boxName}</Text>
                </Pressable>
            </View >
        )

    });
    let close = () => shouldFade.setValue(0);

    return (
        <Animated.View style={[styles.boxMenu, { opacity: fadeAnimation }]} >
            <View style={{ padding: 15, backgroundColor: '#FEF4EA', borderRadius: 10, width: '75%', height: '50%' }}>
                <Pressable onPress={close}>
                    <AntDesign name='close' size={25} color='#2d242b' style={{ marginVertical: 5 }} />
                </Pressable>
                <ScrollView>
                    {menuItems}
                </ScrollView>
            </View>
        </Animated.View>
    )
}


const styles = StyleSheet.create({
    firstBox: {
        marginTop: 30
    },
    linedBox: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#2d242b'

    },
    boxMenu: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(45, 36, 43,0.4)',
    },
    boxMenuItems: {
        paddingHorizontal: 5,
        paddingVertical: 20,
    },
})