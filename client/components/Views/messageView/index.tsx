import { Animated, GestureResponderEvent, Pressable, StatusBar, StyleSheet, Text, TextInput, View, PanResponder } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { RootState, Logout } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import Canvas, { CanvasRenderingContext2D, Path2D } from 'react-native-canvas'
import { StackNavProp } from '../homeView/homeViewNav';
import * as ScreenOrientation from 'expo-screen-orientation'



interface MsgProps {
    canvas: Canvas,

}

const CanvasTextInput: React.FC<MsgProps> = ({ canvas }) => {
    let [text, setText] = useState('');
    let textRef = useRef<TextInput | null>(null);
    let [editable, setEditable] = useState(true);
    let [movable, setMovable] = useState(false);
    const pan = useRef(new Animated.ValueXY({ x: canvas.width / 2, y: canvas.height / 2 })).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (movable) {
            Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished)
                    bounceAnim.setValue(0)
            })
        }
    }, [movable])

    useEffect(() => {
        if (editable && textRef.current) {
            textRef.current.focus();
        }
    }, [editable, textRef])

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => !editable && movable,
        onPanResponderGrant: () => {
            pan.setOffset({
                x: (pan as any).x._value,
                y: (pan as any).y._value
            })
        },
        onPanResponderMove: Animated.event([
            null,
            {
                dx: pan.x,
                dy: pan.y,
            }
        ], {
            useNativeDriver: false
        }),
        onPanResponderRelease: (e, gesture) => {
            setMovable(false);
            console.log(pan);

            pan.flattenOffset()
        }

    });



    const handleLongPress = (e: GestureResponderEvent) => {
        setMovable(true);
    }
    const handleQuickPress = () => {
        setEditable(true);
    }
    useEffect(() => {
        if (editable && textRef.current) {
            textRef.current.focus()
        }
    }, [editable, textRef])

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[{ position: 'absolute' }, pan.getTranslateTransform(), {
                transform: [{
                    scale: bounceAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.5, 1]
                    })
                }]
            }]}
        >
            <Pressable delayLongPress={250} onPress={handleQuickPress} onLongPress={handleLongPress} style={{ padding: 10 }}>
                <TextInput
                    value={text}
                    editable={editable}
                    autoFocus
                    onEndEditing={e => setEditable(false)}
                    ref={textRef}
                    onChangeText={e => setText(e)}
                    style={{ color: 'white', fontSize: 30 }} />
            </Pressable>
        </Animated.View>
    )

}



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
    navigation.addListener('beforeRemove', () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    })
    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }, [])

    const handleCanvas = (canvas: Canvas) => {
        if (canvas) {
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d')
            canvas.height = 320;
            canvas.width = 240;
            ctx.fillRect(0, 0, 240, 320)

        }
    }
    const addText = () => {
        let canvas = canvasRef.current;
        if (canvas) {
            // ctx.fillStyle = 'white'
            // ctx.font = '40px ariel'
            // ctx.fillText('1244', 120, 120)
            // ctx.save();
            setTexts(prev => [...prev, <CanvasTextInput key={prev.length} canvas={canvas!} />])
        }
    }
    const draw = () => {
        const ctx = canvasRef.current;
        if (ctx) {
        }
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
                {/* <View style={styles.btns}>
                    <TouchableOpacity onPress={addText} style={styles.btn}>
                        <Feather name="type" size={30} color="black" />
                        <Text style={styles.btnText}>Insert Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={draw} style={styles.btn}>
                        <MaterialCommunityIcons name="draw" size={30} color="black" />
                        <Text style={styles.btnText}>Draw</Text>
                    </TouchableOpacity>
                </View> */}
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
        paddingVertical: 50,
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