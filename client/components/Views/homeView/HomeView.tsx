import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { StackNavProp } from '../../../types/navigation';
import { ConnectSocket, RootState,Logout } from "../../../redux"
import { SOCKET_STATE } from '../../../types/redux';
import { HomeViewTabParamList } from './homeViewNav';
import { createStackNavigator } from '@react-navigation/stack';
import BoxMessagesView from "./BoxMessagesView"
import AddBoxView from '../addBoxView/AddBoxView';
import MessageView from '../messageView';
import { MaterialIcons } from '@expo/vector-icons';

const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {
    ConnectSocket,
    Logout
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'Home'>

const Stack = createStackNavigator<HomeViewTabParamList>();


const HomeView: React.FC<Props> = ({ navigation, socketState, ConnectSocket,Logout }) => {

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
                    initialRouteName="BoxMessages"
                >
                    <Stack.Screen
                        name='BoxMessages'
                        component={BoxMessagesView}
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
            return (
                <View>
                    <Text>Connecting</Text>
                </View>
            )
        case SOCKET_STATE.OFFLINE:
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons size={60} name="error" color="black" />
                    <Text style={{ fontSize: 25, width: '50%', textAlign: 'center', fontWeight: 'bold' }}>
                        {`Error connecting to server.\nTry again later`}
                    </Text>
                </View>
            );
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FEF4EA'
    },
    tabStyling: {
        backgroundColor: '#FFB8D0',
        paddingBottom: 20,
        height: '10%',
    },

})

export default connector(HomeView);