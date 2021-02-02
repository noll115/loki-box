import { Dimensions, GestureResponderEvent, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { RootState } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import Canvas from 'react-native-canvas'
import { StackNavProp } from '../homeView/homeViewNav';
import { TouchableOpacity, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CanvasTextInput from './CanvasTextInput'
import * as Orientation from "expo-screen-orientation";
import { SketchCanvas } from './SketchCanvas';

const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'SendMessage'>


const _MessageView: React.FC<Props> = ({ user, route, navigation }) => {
    let { box } = route.params
    let canvasRef = useRef<Canvas | null>(null)
    let [texts, setTexts] = useState<JSX.Element[]>([]);
    let textInputsRefs = useRef<Array<CanvasTextInput | null>>([]);
    let [showDrawView, setShowDrawView] = useState(false);
    let sketchCanvas = useRef<SketchCanvas | null>(null);

    useEffect(() => {
        let unsub = navigation.addListener('beforeRemove', e => {
            if (showDrawView) {
                e.preventDefault();
                return setShowDrawView(false);
            }
        })
        return unsub;
    }, [showDrawView])

    useEffect(() => {
        if (showDrawView) {
            Orientation.lockAsync(Orientation.OrientationLock.LANDSCAPE)
                .then(() => sketchCanvas.current?.scaleView())
        } else {
            Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT)
                .then(() => sketchCanvas.current?.scaleView())
        }
    }, [showDrawView])



    const handleCanvas = (canvas: Canvas) => {
        if (canvas && !canvasRef.current) {
            canvasRef.current = canvas;
            sketchCanvas.current = new SketchCanvas(canvas);
        }
    }


    const addText = () => {
        let canvas = canvasRef.current;
        if (canvas) {
            textInputsRefs.current = [...textInputsRefs.current, null];
            setTexts(prev => {
                let newArr = [...prev,
                <CanvasTextInput
                    key={prev.length}
                    ref={ref => textInputsRefs.current[prev.length] = ref}
                    canvas={canvas!}
                    canEdit={!showDrawView}
                />
                ];
                return newArr
            })
        }
    }

    const submit = () => {
        const ctx = canvasRef.current?.getContext('2d');
        textInputsRefs.current.forEach(ref => {
            let data = ref?.getInputData();
            console.log(ref);

            if (ctx && data) {
                console.log(data);
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'white'
                ctx.font = `${data.fontSize}px arial`;
                ctx.fillText(data.text, data.pos.x, data.fontSize + data.pos.y)
            }

        });
        setTexts([]);
        textInputsRefs.current = [];
    }


    const drawStart = (e: GestureResponderEvent) => {
        let { locationX: x, locationY: y } = e.nativeEvent;
        if (showDrawView)
            sketchCanvas.current?.startDraw({ x, y });
    }

    const drawLines = (e: GestureResponderEvent) => {
        let { locationX: x, locationY: y } = e.nativeEvent;
        e.preventDefault();
        if (showDrawView)
            sketchCanvas.current?.draw({ x, y });
    }
    const drawEnd = () => {
        sketchCanvas.current?.endDraw();
    }

    const undo = () => {
        sketchCanvas.current?.undo();
    }

    const switchToDraw = () => {
        setShowDrawView(true);
    }

    return (
        <View style={styles.container}>
            { !showDrawView && <View style={styles.header} >
                <Text style={styles.headerText}>Sending message to {box.boxName}</Text>
            </View>}
            <View style={[styles.body, showDrawView && { paddingVertical: 0, justifyContent: 'center' }]}>
                <View onTouchStart={drawStart} onTouchMove={drawLines} onTouchEnd={drawEnd} style={showDrawView && { transform: [{ scale: 1.5 }] }}>
                    <Canvas ref={handleCanvas} style={[{ backgroundColor: 'black' }, showDrawView && { justifyContent: 'center', alignItems: 'center' }]} />
                    {texts}
                </View>
                {!showDrawView && <View style={styles.btns}>
                    <TouchableOpacity onPress={addText} style={styles.btn}>
                        <Feather name="type" size={30} color="black" />
                        <Text style={styles.btnText}>Insert Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={switchToDraw} style={styles.btn}>
                        <MaterialCommunityIcons name="draw" size={30} color="black" />
                        <Text style={styles.btnText}>Draw</Text>
                    </TouchableOpacity>
                </View>}
            </View>
            {!showDrawView && <View style={{ flex: 2, margin: 20, backgroundColor: '#D4668E', borderRadius: 20 }}>
                <TouchableOpacity style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={submit}>
                    <Text style={{ fontSize: 25 }}>Submit</Text>
                </TouchableOpacity>
            </View>}
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