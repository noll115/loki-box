import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react'
import { RootState, RefreshMessages, useAppSelector, useAppDispatch } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../homeView/homeViewNav';
import { SketchCanvas } from './SketchCanvas';
import { SubmittedScreen } from './SubmittedScreen'
import BoxListHeader from '../../BoxListHeader';


let selectorSize = 50

type Props = StackNavProp<'SendMessage'>
export const MessageView: React.FC<Props> = ({ route, navigation }) => {
    const socket = useAppSelector(state => state.socket.socket);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    let [sketchSubmitted, setSketchSubmitted] = useState(false);
    let { box } = route.params

    const submit = () => {
        setSketchSubmitted(true)
    }

    const onDone = () => {
        dispatch(RefreshMessages()).then(() => navigation.pop())
    }


    return (
        <View style={styles.container}>
            {!sketchSubmitted &&
                <>
                    <BoxListHeader />
                    <View style={styles.body}>
                        <SketchCanvas height={240} width={320} onSubmit={submit} socket={socket!} box={box} />
                    </View>
                </>
            }
            {sketchSubmitted && <SubmittedScreen onPress={onDone} />}
        </View >
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    header: {
        paddingTop: StatusBar.currentHeight,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 20
    },
    headerText: {
        fontSize: 24,
        color: '#2D242B',
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