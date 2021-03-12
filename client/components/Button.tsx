import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle, View } from 'react-native';


interface Props {
    onPress: () => void,
    title: string | JSX.Element,
    isDisabled?: boolean,
    btnStyle?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<TextStyle>,
    enableShadow?: boolean,
    icon?: JSX.Element
}



const Button: React.FC<Props> = ({ btnStyle, textStyle, onPress, title, isDisabled, icon, enableShadow }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, btnStyle, isDisabled && styles.btnDisabled, enableShadow && styles.btnShadow]} disabled={isDisabled}>
            <Text style={[styles.btnText, textStyle]}>{title}</Text>{icon && <View style={{ marginLeft: 9 }}>{icon}</View>}
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    button: {
        position: 'relative',
        backgroundColor: '#D4668E',
        borderRadius: 10,
        padding: '5%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',

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
        textAlign: 'center',
        color: '#FEF4EA',
        fontWeight: 'bold',
        fontSize: 20
    },
    btnDisabled: {
        opacity: 0.3
    }
})
export default Button;