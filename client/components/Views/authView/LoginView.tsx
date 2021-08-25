import React, { useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../redux'
import Button from '../../Button';
import { Login, RemoveError } from '../../../redux'
import { StackNavProp } from '../../../types/navigation';
import UserForm, { UserFormMethods } from '../../UserForm';
import { AUTH_STATE } from '../../../types/redux';



type Props = StackNavProp<'Login'>



const LoginView: React.FC<Props> = ({ navigation }) => {
    const auth = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const form = useRef<UserFormMethods>(null);
    let loading = auth.state === AUTH_STATE.LOGGING_IN;
    const LoginUser = (email: string, pass: string) => {
        dispatch(Login(email, pass));
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <UserForm ref={form} onSubmit={LoginUser} error={auth.error} formType='login' disableSubmit={loading} />
            <Button
                title='Sign Up'
                onPress={() => {
                    form.current?.clearText();
                    dispatch(RemoveError());
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

export default LoginView;