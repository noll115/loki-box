import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react'
import { RootState, RefreshMessages } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../homeView/homeViewNav';
import { SketchCanvas } from './SketchCanvas';
import { SubmittedScreen } from './SubmittedScreen'
import BoxListHeader from '../../BoxListHeader';


let selectorSize = 50


const mapState = (state: RootState) => ({
    user: state.user,
    socketState: state.socket
})

const mapDispatch = {
    RefreshMessages
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'SendMessage'>
const _MessageView: React.FC<Props> = ({ user, route, navigation, socketState: { socket }, RefreshMessages }) => {
    let [sketchSubmitted, setSketchSubmitted] = useState(false);
    let { box } = route.params

    const submit = () => {
        setSketchSubmitted(true)
    }

    const onDone = () => {
        RefreshMessages().then(() => navigation.pop())
    }


    return (
        <View style={styles.container}>
            { !sketchSubmitted &&
                <>
                    <BoxListHeader />
                    <View style={styles.body}>
                        <SketchCanvas height={240} width={320} onSubmit={submit} socket={socket!} box={box} />
                    </View>
                </>
            }
            {   sketchSubmitted && <SubmittedScreen onPress={onDone} />}
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