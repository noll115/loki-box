import { Dimensions, GestureResponderEvent, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { useEffect, useState } from 'react'
import { RootState } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../homeView/homeViewNav';
import { TouchableOpacity, PanGestureHandlerGestureEvent, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Orientation from "expo-screen-orientation";
import { useSketchCanvas } from './SketchCanvas';
import Svg, { Defs, Stop, LinearGradient, Rect } from 'react-native-svg';
import Animated from 'react-native-reanimated';

const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'SendMessage'>



function Canvasbtns() {
    let [height, setHeight] = useState(0);

    let stops = [];
    stops.push('hsl(0, 100%, 0%)')
    stops.push('hsl(0, 100%, 100%)')
    for (let i = 0; i <= 360; i += 360 / 5) {
        stops.push(`hsl(${i}, 100%, 50%)`)
    }
    let percentage = 100 / stops.length;
    
    let panHandler = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        let { y } = nativeEvent;
        y = Math.min(Math.max(0, y),height)
        switch (nativeEvent.state) {
            case State.BEGAN:
                break;
            case State.ACTIVE:
                console.log(y / height)
                break;
            case State.END:
                break;
        }
    }

    return (
        <View style={{ position: 'absolute', right: 10, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <PanGestureHandler
                onGestureEvent={panHandler}
                onHandlerStateChange={panHandler}
            >
                <Svg
                    style={{ width: '30', height: '50%' }}
                    onLayout={e => setHeight(e.nativeEvent.layout.height)}
                >
                    <Animated.View />
                    <Defs>
                        <LinearGradient id="grad" x1='0' x2='0' y1='0' y2='1'>
                            {stops.map((col, i) => <Stop offset={`${i * percentage}%`} stopColor={col} />)}
                        </LinearGradient>
                    </Defs>
                    <Rect height='100%' width='100%' fill='url(#grad)' />
                </Svg>
            </PanGestureHandler>
        </View>
    )
}

const _MessageView: React.FC<Props> = ({ user, route, navigation }) => {
    let { box } = route.params
    let [showDrawView, setShowDrawView] = useState(false);
    let canvas = useSketchCanvas(320, 240);

    useEffect(() => {
        let unsub = navigation.addListener('beforeRemove', e => {
            if (showDrawView) {
                e.preventDefault();
                return Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT)
                    .then(() => {
                        canvas.setLandScapeMode(false)
                        setShowDrawView(false)
                    });
            }
        })
        return unsub;
    }, [showDrawView])

    useEffect(() => {
        if (!showDrawView)
            Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT)
    }, [showDrawView])




    let switchOrientation = () =>
        Orientation.lockAsync(Orientation.OrientationLock.LANDSCAPE)
            .then(() => {
                canvas.setLandScapeMode(true);
                setShowDrawView(true);
            })


    return (
        <View style={styles.container}>
            {showDrawView && <Canvasbtns />}
            {!showDrawView &&
                <View style={styles.header} >
                    <Text style={styles.headerText}>Sending message to {box.boxName}</Text>
                </View>
            }
            <View style={[styles.body, showDrawView && { paddingVertical: 0, justifyContent: 'center' }]}>
                <View >
                    {canvas.render}
                </View>
                {!showDrawView &&
                    <View style={styles.btns}>
                        <TouchableOpacity onPress={canvas.addText} style={styles.btn}>
                            <Feather name="type" size={30} color="black" />
                            <Text style={styles.btnText}>Insert Text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={switchOrientation} style={styles.btn}>
                            <MaterialCommunityIcons name="draw" size={30} color="black" />
                            <Text style={styles.btnText}>Draw</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
            {!showDrawView &&
                <View style={{ flex: 2, margin: 20, backgroundColor: '#D4668E', borderRadius: 20 }}>
                    <TouchableOpacity style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={canvas.submit}>
                        <Text style={{ fontSize: 25 }}>Submit</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
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
        paddingBottom: 20
    },
    headerText: {
        fontSize: 24,
        color: '#FEF4EA',
    },
    body: {
        paddingVertical: '3%',
        flex: 15,
        alignItems: 'center',
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