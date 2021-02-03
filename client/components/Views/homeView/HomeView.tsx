import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../../../types/navigation';
import { ConnectSocket, RootState } from "../../../redux"
import { SOCKET_STATE } from '../../../types/redux';
import { HomeViewTabParamList } from './homeViewNav';
import { createStackNavigator } from '@react-navigation/stack';
import BoxListView from "./BoxListView"
import AddBoxView from '../addBoxView/AddBoxView';
import MessageView from '../messageView';

const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {
    ConnectSocket,
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'Home'>

const Stack = createStackNavigator<HomeViewTabParamList>();


const HomeView: React.FC<Props> = ({ navigation, socketState, ConnectSocket }) => {

    useEffect(() => {
        ConnectSocket()
    }, [])

    switch (socketState.state) {
        case SOCKET_STATE.ONLINE:
            return (
                <Stack.Navigator
                    headerMode='none'
                    screenOptions={{
                        cardStyle: styles.container
                    }}
                    initialRouteName="BoxList">
                    <Stack.Screen
                        name='BoxList'
                        component={BoxListView}
                    />
                    <Stack.Screen
                        name='AddBox'
                        component={AddBoxView}
                    />
                    <Stack.Screen
                        name='SendMessage'
                        component={MessageView}
                    />

                </Stack.Navigator>
            )
        case SOCKET_STATE.CONNECTING:
        case SOCKET_STATE.OFFLINE:
            return <View></View>;
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFCABE'
    },
    tabStyling: {
        backgroundColor: '#FFB8D0',
        paddingBottom: 20,
        height: '10%',
    },

})

export default connector(HomeView);