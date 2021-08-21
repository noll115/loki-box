import { TouchableOpacity } from 'react-native-gesture-handler';
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { StatusBar, StyleSheet, Text, View, Dimensions, Pressable } from 'react-native';
import Animated, { and, block, call, Clock, cond, debug, EasingNode, interpolateNode, neq, not, set, startClock, stopClock, timing, useValue } from "react-native-reanimated";
import React, { useEffect, useState } from 'react'
import { RootState, Logout } from '../redux';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
    Logout
}

const connector = connect(mapState, mapDispatch);

function slideAnim(clock: Clock, open: Animated.Value<0 | 1>, closeDrawer: () => void) {
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
            and(open as any, neq(config.toValue, 1)),
            [
                set(config.toValue, 1),
                set(state.finished, 0),
                set(state.time, 0),
                set(state.position, 0),
                set(state.frameTime, 0),
                startClock(clock),
            ]
        ),
        cond(
            and(not(open), neq(config.toValue, 0)),
            [
                set(config.toValue, 0),
                set(state.finished, 0),
                set(state.time, 0),
                set(state.position, 1),
                set(state.frameTime, 0),
                startClock(clock),
            ]
        ),
        timing(clock, state, config),
        cond(state.finished, [
            stopClock(clock),
            cond(
                not(config.toValue),
                call([], closeDrawer)
            )
        ]
        ),
        state.position,
    ]);
}



type Props = { btns: Record<string, { fn: () => void, icon: React.FC }> } & ConnectedProps<typeof connector>


let windowWidth = Dimensions.get('window').width;

const DrawerMenu: React.FC<Props> = ({ user, btns, Logout }) => {

    const clock = new Clock();
    const openVal = useValue<0 | 1>(0);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const closeDrawer = () => {
        setDrawerOpen(false);
    }

    const slideAnimation = slideAnim(clock, openVal, closeDrawer);

    useEffect(() => {
        if (drawerOpen) {
            openVal.setValue(1);
        }
    }, [drawerOpen])

    let bodyBtns: JSX.Element[] = []
    for (const key in btns) {
        let Icon = btns[key].icon;
        let funcWrap = () => {
            openVal.setValue(0);
            btns[key].fn()
        }
        bodyBtns.push(
            <TouchableOpacity key={key} onPress={funcWrap} style={styles.bodyBtnContainer}>
                <View style={styles.bodyBtn}>
                    <Icon />
                    <Text style={styles.bodyBtnText}>Add a box</Text>
                </View>
            </TouchableOpacity>
        )
    }


    return (
        <>
            <View style={styles.drawerOpenContainer}>
                <Pressable style={styles.drawerOpenBtn} onPress={() => setDrawerOpen(true)} >
                    <AntDesign name={'menu-fold'} size={27} style={{ color: "#2D242B" }} />
                </Pressable>
            </View>
            {drawerOpen && <Animated.View
                style={[styles.drawerContainer, { opacity: slideAnimation }]}
            >
                <Animated.View style={[styles.drawer, {
                    transform: [{
                        translateX: interpolateNode(slideAnimation, {
                            inputRange: [0, 1],
                            outputRange: [-windowWidth, 0]
                        })
                    }]
                }]}>
                    <View style={styles.drawerHeader}>
                        <View style={styles.drawerCloseContainer}>
                            <Pressable style={styles.drawerCloseBtn} onPress={() => openVal.setValue(0)} >
                                <AntDesign name='close' size={27} style={{ color: "#2D242B" }} />
                            </Pressable>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="hearto" size={120} color="#2D242B" />
                            <Feather style={{ position: 'absolute' }} name="box" size={60} color="#2D242B" />
                        </View>
                        <Text style={styles.userEmail}>My account</Text>
                    </View>
                    <View style={styles.drawerBody}>
                        {bodyBtns}
                        <View style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            marginBottom: 25
                        }} >
                            <Pressable onPress={Logout} style={styles.bodyBtnContainer}>
                                <View style={styles.bodyBtn}>
                                    <FontAwesome name="sign-out" size={35} color="#2D242B" />
                                    <Text style={styles.bodyBtnText}>Sign out</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View >}
        </>
    )
}

export default connector(DrawerMenu)

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.4)',
        height: '100%',
        width: '100%',
    },
    drawer: {
        width: '80%',
        backgroundColor: '#FFCABE',
        shadowColor: "#000",
        height: '100%',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,
    },
    drawerHeader: {
        backgroundColor: '#D4668E',
        paddingBottom: 20
    },
    drawerBody: {
        flex: 1,
    },
    userEmail: {
        alignSelf: 'center',
        paddingLeft: 20,
        fontSize: 30,
        color: '#2D242B'
    },
    bodyBtnContainer: {
        paddingVertical: 30,
    },
    bodyBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    bodyBtnText: {
        paddingLeft: 15,
        fontSize: 20,
        color: '#2D242B'
    },
    drawerOpenContainer: {
        left: '5%',
        position: 'absolute',
        paddingTop: StatusBar.currentHeight,
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
    },
    drawerOpenBtn: {
        padding: 5,
        backgroundColor: '#FEF4EA',
        borderRadius: 10,
        elevation: 15
    },
    drawerCloseContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 100,
        paddingTop: StatusBar.currentHeight
    },
    drawerCloseBtn: {
        left: '5%',
        padding: 5
    }
})