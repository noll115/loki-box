import { Dimensions, GestureResponderEvent, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react'
import { RootState } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../homeView/homeViewNav';
import { TouchableOpacity, PanGestureHandlerGestureEvent, PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Orientation from "expo-screen-orientation";
import { useSketchCanvas } from './SketchCanvas';
import Svg, { Rect } from 'react-native-svg';
import Animated, { block, call, cond, debug, divide, eq, interpolateColors, max, min, multiply, not, set, sub, useValue } from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";



let selectorSize = 50

interface canvasBtnProps {
    setColor(newCol: string): void
}

const Canvasbtns: React.FC<canvasBtnProps> = ({ setColor }) => {
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
        <View style={canvasBtnStyle.container}>
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
        </View >
    )
}

const canvasBtnStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
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





const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'SendMessage'>
const _MessageView: React.FC<Props> = ({ user, route, navigation }) => {
    let { box } = route.params
    let [bannerHeight, setBannerHeight] = useState(0);
    let canvas = useSketchCanvas(320, 240, bannerHeight);
    useEffect(() => {
        let unsubFocus = navigation.addListener('focus', e => {
            Orientation.lockAsync(Orientation.OrientationLock.LANDSCAPE)
        })
        let unsubBeforeRem = navigation.addListener('beforeRemove', () => {

            Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT)
        })
        return () => {
            unsubFocus();
            unsubBeforeRem();
        };
    }, [])

    let CanvasBtn = useMemo(() => <Canvasbtns setColor={canvas.setColor} />, [])

    return (
        <View style={styles.container}>
            <View style={styles.header}
                onLayout={({ nativeEvent }) => setBannerHeight(nativeEvent.layout.height)}
            >
                <Text style={styles.headerText}>Sending message to {box.boxName}</Text>
            </View>
            <View style={styles.body}>
                {canvas.render}
                {CanvasBtn}
            </View>
        </View >
    )
}

const MessageView = connector(_MessageView);
export default MessageView;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    header: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#485696',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 10
    },
    headerText: {
        fontSize: 24,
        color: '#FEF4EA',
    },
    body: {
        flex: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
        width: '90%'
    },
    btn: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#D4668E',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnText: {
        fontSize: 20,
    }

})