import React, { useRef } from 'react'
import { StyleSheet, Text, View, TextInput, Animated } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../../redux'
import Button from '../../Button';
import { Login, RemoveError } from '../../../redux'
import { StackNavProp } from '../../../types/navigation';
import UserForm, { UserFormMethods } from '../../UserForm';
import { AUTH_STATE } from '../../../types/redux';



const mapState = (state: RootState) => ({
    auth: state.auth
})

const mapDispatch = {
    Login, RemoveError
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & { navigation: StackNavProp<'Login'> }



const LoginView = ({ navigation, Login, auth, RemoveError }: Props) => {

    const form = useRef<UserFormMethods>(null);
    let loading = auth.state === AUTH_STATE.LOGGING_IN;
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <UserForm ref={form} onSubmit={Login} error={auth.error} formType='login' disableSubmit={loading} />
            <Button
                title='Sign Up'
                onPress={() => {
                    form.current?.clearText();
                    RemoveError();
                    navigation.push('Register');
                }}
                btnStyle={styles.signUpBtn}
                textStyle={styles.signUpBtnText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF4EA',
        padding: '10%',
        paddingTop: '15%',
    },
    title: {
        alignSelf: 'center',
        marginTop: 20,
        fontSize: 40,
        fontWeight: 'bold',
        color: '#444444'
    },
    signUpBtn: {
        marginTop: 30,
        backgroundColor: 'transparent',
    },
    signUpBtnText: {
        color: '#247BA0'

    }
})

export default connector(LoginView);