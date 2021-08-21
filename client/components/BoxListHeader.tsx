import { AntDesign } from "@expo/vector-icons";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react'
import { RootState, SelectBox } from '../redux';
import { connect, ConnectedProps } from 'react-redux';
import Animated, { and, block, call, Clock, cond, debug, EasingNode, eq, neq, not, set, startClock, stopClock, timing, useValue } from 'react-native-reanimated'



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

const mapState = (state: RootState) => ({
    user: state.user,
})

const mapDispatch = {
    SelectBox
}

const connector = connect(mapState, mapDispatch);

type Props = {} & ConnectedProps<typeof connector>


const BoxListHeader: React.FC<Props> = ({ user, SelectBox }) => {
    let { boxes, selectedBox } = user;
    const [boxListOpen, setBoxListOpen] = useState(false);
    const shouldFade = useValue<0 | 1>(0);

    useEffect(() => {
        if (boxListOpen)
            shouldFade.setValue(1);
    }, [boxListOpen]);


    const clock = new Clock();
    const closeList = () => {
        setBoxListOpen(false);
    }
    const fadeAnimation = fadeAnim(clock, shouldFade, closeList);

    if (boxes === null) {
        return null;
    }


    let menuItems = boxes.map((box, index) => {
        let isFirst = index === 0;
        if (box.box === selectedBox?.box) {
            return null;
        }
        let selectBox = () => SelectBox(box);
        return (
            <View key={index}>
                {!isFirst && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#2d242b' }}></View>}
                <Pressable
                    style={styles.boxMenuItems}
                    onPress={selectBox}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize' }}>{box.boxName}</Text>
                </Pressable>
            </View >
        )

    });

    let hasBoxes = boxes.length > 1;

    let close = () => shouldFade.setValue(0);

    const showBoxList = () => {
        setBoxListOpen(true);
    }

    return (
        <>
            <View style={styles.boxListTitle}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={hasBoxes ? showBoxList : undefined}>
                        <Text style={styles.boxListTitleText}>
                            {selectedBox ? selectedBox.boxName : "Add a Box!"}
                        </Text>
                        {hasBoxes && <AntDesign name="caretdown" size={20} style={{ marginLeft: 10 }} color="#2D242B" />}
                    </Pressable>
                </View>
            </View>
            {
                boxListOpen &&
                <Animated.View style={[styles.boxMenu, { opacity: fadeAnimation }]}>
                    <View style={{ padding: 15, backgroundColor: '#FEF4EA', borderRadius: 10, width: '75%', height: '50%' }}>
                        <Pressable onPress={close}>
                            <AntDesign name='close' size={25} color='#2d242b' style={{ marginVertical: 5 }} />
                        </Pressable>
                        <ScrollView>
                            {menuItems}
                        </ScrollView>
                    </View>
                </Animated.View>
            }
        </>
    )
}


export default connector(BoxListHeader)

const styles = StyleSheet.create({
    boxListTitle: {
        paddingTop: StatusBar.currentHeight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: 100,
    },
    boxListTitleText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#2D242B',
        backgroundColor: '#FEF4EA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5
    },
    firstBox: {
        marginTop: 30
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