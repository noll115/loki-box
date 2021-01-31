import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { forwardRef, useRef, useState } from 'react'
import { RootState } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import Canvas from 'react-native-canvas'
import { StackNavProp } from '../homeView/homeViewNav';
import { TouchableOpacity, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CanvasTextInput from './CanvasTextInput'


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


    const handleCanvas = (canvas: Canvas) => {
        if (canvas && !canvasRef.current) {
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d')
            canvas.height = 240;
            canvas.width = 320;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
                    canvas={canvas!} />
                ];
                return newArr
            })
        }
    }
    const draw = () => {
        const ctx = canvasRef.current;
        if (ctx) {
        }
    }

    const submit = () => {
        const ctx = canvasRef.current?.getContext('2d');
        console.log(textInputsRefs.current);

        textInputsRefs.current.forEach(ref => {
            let data = ref?.getInputData();
            console.log(ref);

            if (ctx && data) {
                console.log(data);

                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'white'
                ctx.font = `${data.fontSize}px arial`;
                ctx.strokeRect(data.pos.x, data.pos.y, data.width, data.height);
                ctx.fillText(data.text, data.pos.x, data.fontSize + data.pos.y)
            }

        });
        setTexts([]);
        textInputsRefs.current = [];
    }

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Text style={styles.headerText}>Sending message to {box.boxName}</Text>
            </View>
            <View style={styles.body}>
                <View>
                    <Canvas ref={handleCanvas} style={{ borderWidth: 1 }} />
                    {texts}
                </View>
                <View style={styles.btns}>
                    <TouchableOpacity onPress={addText} style={styles.btn}>
                        <Feather name="type" size={30} color="black" />
                        <Text style={styles.btnText}>Insert Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={draw} style={styles.btn}>
                        <MaterialCommunityIcons name="draw" size={30} color="black" />
                        <Text style={styles.btnText}>Draw</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 2, margin: 20, backgroundColor: '#D4668E', borderRadius: 20 }}>
                <TouchableOpacity style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={submit}>
                    <Text style={{ fontSize: 25 }}>Submit</Text>
                </TouchableOpacity>

            </View>
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