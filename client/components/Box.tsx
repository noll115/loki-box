import { AntDesign, Feather } from "@expo/vector-icons";
import { Pressable, StatusBar, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react'
import { IBox } from "../types/general";


type Props = {
    boxInfo: IBox,
    style: StyleProp<ViewStyle>
}


const Box: React.FC<Props> = ({ boxInfo, style }) => {
    let { box, boxName, seenAs } = boxInfo;
    return (
        <Pressable style={[styles.boxContainer, style]} >
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.2 }}>
                <AntDesign name="heart" size={30} color="#D4668E" />
                <Feather name="box" size={40} color="#444444" />
            </View>
            <View style={{ flex: 0.8 }}>
                <Text>{boxName}</Text>
            </View>
        </Pressable>
    )
}


export default Box;

const styles = StyleSheet.create({
    floatingBtn: {
        position: 'absolute',
        height: 70,
        width: 70,
        bottom: '5%',
        right: '5%',
        borderRadius: 50
    },
    boxListTitle: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#485696',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    boxListTitleText: {
        paddingTop: '4%',
        fontSize: 30,
        paddingBottom: '4%',
        fontWeight: 'bold',
        color: '#FFCABE'
    },
    boxContainer: {
        backgroundColor: '#FEF4EA',
        marginBottom: 30,
        marginHorizontal: 20,
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
        fontSize: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.43,
        shadowRadius: 9.51,
        elevation: 15,
    }
})