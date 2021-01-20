import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import { StackNavProp } from '../../../types/navigation';
import { ScrollView } from 'react-native-gesture-handler';
import { ConnectSocket, RootState } from "../../../redux"
import { SOCKET_STATE } from '../../../types/redux';
import { HomeViewTabParamList, NavBar } from './homeViewNav';
import QRScanner from './QRScanner';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Socket } from 'socket.io-client';
import { FontAwesome5 } from "@expo/vector-icons";


const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {
    ConnectSocket
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & { navigation: StackNavProp<'Home'> }

const Tab = createBottomTabNavigator<HomeViewTabParamList>();


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
    switch (socketState.state) {
        case SOCKET_STATE.ONLINE:
            return (
                <Tab.Navigator
                    initialRouteName="BoxList"
                    sceneContainerStyle={styles.container}
                    tabBarOptions={{
                        activeTintColor: '#FEF4EA',
                        inactiveTintColor: 'rgba(82, 65, 76,0.5)',
                        style: styles.tabStyling
                    }}
                    tabBar={props => <NavBar {...props} />}
                >
                    <Tab.Screen
                        name='BoxList'
                        options={{
                            tabBarLabel: 'View Boxes',
                            tabBarIcon: ({ size, color }) => (
                                <FontAwesome5 name="boxes" size={size} color={color} />
                            )
                        }}

                        component={BoxList}
                    />
                    <Tab.Screen
                        name='QRScanner'
                        options={{
                            tabBarLabel: 'Add Box',
                            tabBarIcon: ({ size, color }) => (
                                <FontAwesome5 name="plus" size={size} color={color} />
                            ),

                        }}
                        component={QRScanner} />
                </Tab.Navigator>
            )
        case SOCKET_STATE.CONNECTING:
        case SOCKET_STATE.OFFLINE:
            return <View></View>;
    }

}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
        paddingVertical: 50,
        flex: 1,
        backgroundColor: '#FEF4EA'
    },
    tabStyling: {
        backgroundColor: '#FFB8D0',
        paddingBottom: 20,
        height: '10%',
    }
})

export default connector(HomeView);