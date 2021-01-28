import React from 'react'
import { StyleSheet, Text, View, TextInput, Animated } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { Register, RootState } from '../../../redux'
import { StackNavProp } from '../../../types/navigation';
import UserForm from '../../UserForm';




const mapState = (state: RootState) => ({
    auth: state.auth
})

const mapDispatch = {
    Register
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'Register'>



const RegisterView = ({ navigation, auth, Register }: Props) => {


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <UserForm onSubmit={Register} error={auth.error} formType={'register'} />
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

export default connector(RegisterView);