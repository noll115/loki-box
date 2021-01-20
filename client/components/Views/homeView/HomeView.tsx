import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import { StackNavProp } from '../../../types/navigation';
import { ScrollView } from 'react-native-gesture-handler';
import { ConnectSocket, RootState } from "../../../redux"
import { SOCKET_STATE } from '../../../types/redux';
import { HomeViewTabParamList } from './homeViewNav';
import QRScanner from './QRScanner';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Socket } from 'socket.io-client';


const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {
    ConnectSocket
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & { navigation: StackNavProp<'Home'> }

const Tab = createMaterialBottomTabNavigator<HomeViewTabParamList>();


interface IBox {
    box: string,
    seenAs: string,
    boxName: string
}


const BoxList = () => {
    const [boxes, setBoxes] = useState<IBox[]>([]);
    const socket = useSelector<RootState, Socket | null>(state => state.socket.socket);
    
    useEffect(() => {
        if (socket) {
            socket.emit('getBoxes', (newBoxes: IBox[]) => {
                setBoxes(newBoxes);
            })
        }
    }, [])



    let boxElems = boxes.map((box) => (
        <View>
            <Text>{box.boxName}</Text>
            <Text>{box.box}</Text>
            <Text>{box.seenAs}</Text>
        </View>
    ))

    return (
        <ScrollView>
            {boxElems}
        </ScrollView>
    )
}


const HomeView: React.FC<Props> = ({ navigation, socketState, ConnectSocket }) => {



    useEffect(() => {
        ConnectSocket()
    }, [])

    let body = null;
    if (socketState.state === SOCKET_STATE.CONNECTING) {
        body = <Text>Connecting...</Text>;
    }
    else if (socketState.state === SOCKET_STATE.OFFLINE) {
        body = <Text>{socketState.error}</Text>
    }

    return (
        <Tab.Navigator style={styles.container} barStyle={{ position: 'absolute' }}>
            <Tab.Screen name='BoxList' options={{ title: 'View Boxes' }} component={BoxList} />
            <Tab.Screen name='QRScanner' options={{ title: 'Add Box' }} component={QRScanner} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
        paddingVertical: 50
    }
})

export default connector(HomeView);