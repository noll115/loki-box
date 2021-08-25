import React from 'react'
import { StyleSheet, Text, View, TextInput, Animated } from 'react-native';
import { Register, useAppDispatch, useAppSelector } from '../../../redux'
import { StackNavProp } from '../../../types/navigation';
import UserForm from '../../UserForm';


type Props = StackNavProp<'Register'>



const RegisterView: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(state => state.auth);

    const registerUser = (email: string, pass: string) => {
        dispatch(Register(email, pass));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <UserForm onSubmit={registerUser} error={auth.error} formType={'register'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF4EA',
        padding: '10%',
        paddingTop: '15%'
    },
    title: {
        marginTop: 20,
        fontSize: 40,
        width: '100%',
        fontWeight: 'bold',
        color: '#444444'
    }
})

export default RegisterView;