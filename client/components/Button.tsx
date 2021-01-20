import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';


interface Props {
    onPress: () => void,
    title: string,
    isDisabled?: boolean,
    btnStyle?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<TextStyle>,
    enableShadow?: boolean
}



const Button: React.FC<Props> = ({ btnStyle, textStyle, onPress, title, isDisabled, enableShadow }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, btnStyle, isDisabled && styles.btnDisabled, enableShadow && styles.btnShadow]} disabled={isDisabled}>
            <Text style={[styles.btnText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: '#D4668E',
        borderRadius: 10,
        padding: '5%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',

    },
    btnShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6
    },
    btnText: {
        color: '#444444',
        fontWeight: 'bold',
        fontSize: 20
    },
    btnDisabled: {
        opacity: 0.3
    }
})
export default Button;