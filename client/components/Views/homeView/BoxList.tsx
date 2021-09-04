import { AntDesign } from "@expo/vector-icons"
import React, { FC, useEffect } from "react"
import { Text } from "react-native"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import Animated, { Clock, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { SelectBox, useAppDispatch, useAppSelector } from "../../../redux"

type Props = {
    boxListOpen: boolean,
    hideBoxList: () => void
}

export const BoxList: FC<Props> = ({ boxListOpen, hideBoxList }) => {

    const { boxes, selectedBox } = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const boxOpen = useSharedValue(false);

    const fadeStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(boxOpen.value ? 1 : 0, {
                duration: 250
            }, finished => {
                if (finished) {
                    console.log('boxopen', boxOpen.value);
                    if (!boxOpen.value) {
                        runOnJS(hideBoxList)()
                    }
                }
            })
        }
    }, []);


    useEffect(() => {
        if (boxListOpen)
            boxOpen.value = true;
    }, [boxListOpen]);

    const clock = new Clock();

    if (!boxListOpen)
        return null;


    let menuItems = boxes!.filter(box => box.boxID !== selectedBox?.boxID).map((box, index) => {
        let isFirst = index === 0;
        if (box.boxID === selectedBox?.boxID) {
            return null;
        }
        let selectBox = () => {
            boxOpen.value = false;
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
    let close = () => boxOpen.value = false;

    return (
        <Animated.View style={[styles.boxMenu, fadeStyle]} >
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