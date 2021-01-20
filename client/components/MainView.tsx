import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { RootState, GetTokenInStorage } from '../redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import { AUTH_STATE } from '../types/redux';
import { LoginView, RegisterView, HomeView } from './Views';
import { RootStackParamList } from '../types/navigation';





const mapState = (state: RootState) => ({
    authState: state.auth.state
})

const mapDispatch = {
    GetTokenInStorage
}

const connector = connect(mapState, mapDispatch);



const SplashScreen: React.FC = () => {
    return (
        <Text style={{ ...StyleSheet.absoluteFillObject, padding: 40 }}>Finding Token...</Text>
    )
}



function determineScreen(authState: AUTH_STATE): JSX.Element | null {
    switch (authState) {
        case AUTH_STATE.LOGGED_IN:
            return (
                <>
                    <Stack.Screen name="Home" component={HomeView} />
                </>
            );
        case AUTH_STATE.LOGGING_IN:
            return (
                <Stack.Screen name="Splash" component={SplashScreen} />
            );
        case AUTH_STATE.NOT_LOGGED_IN:
            return (
                <>
                    <Stack.Screen name="Login" component={LoginView} />
                    <Stack.Screen name="Register" component={RegisterView} />
                </>);

        default:
            return null;
    }
}

const Stack = createStackNavigator<RootStackParamList>();

type Props = ConnectedProps<typeof connector>;


const MainView: React.FC<Props> = ({ authState, GetTokenInStorage }) => {

    useEffect(() => {
        GetTokenInStorage();
    }, [])



    return (
        <NavigationContainer>
            <Stack.Navigator headerMode='none'>
                {determineScreen(authState)}
            </Stack.Navigator>

        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});


export default connector(MainView);


