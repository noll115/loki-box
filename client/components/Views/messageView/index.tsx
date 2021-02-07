import { Dimensions, GestureResponderEvent, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react'
import { RootState } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../homeView/homeViewNav';
import * as Orientation from "expo-screen-orientation";
import { useSketchCanvas } from './SketchCanvas';
import { Canvasbtns } from "./CanvasBtns"


let selectorSize = 50







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


    let CanvasBtn = useMemo(() => <Canvasbtns sketchCanvas={canvas} />, [canvas.currentTool, canvas.canvasState])

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
        paddingBottom: 20
    },
    headerText: {
        fontSize: 24,
        color: '#FEF4EA',
    },
    body: {
        paddingTop: '8%',
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