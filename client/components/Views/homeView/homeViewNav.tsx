import { BottomTabBarOptions, BottomTabBarProps, BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import React, { useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'


export interface HomeViewTabParamList extends Record<string, object | undefined> {
    BoxList: undefined,
    QRScanner: undefined
    AddBox: {
        boxID: string,
        secretToken: string
    }
}

export type TabNavProp<RouteName extends keyof HomeViewTabParamList = string> = BottomTabNavigationProp<HomeViewTabParamList, RouteName>

export const NavBar: React.FC<BottomTabBarProps<BottomTabBarOptions>> = ({ navigation }) => {
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const bounce = () => {
        Animated.spring(bounceAnim, {
            toValue: 1,
            useNativeDriver: true
        }).start();
    }

    return (
        <View style={styles.barContainer}>
            <View style={styles.leftBtn}></View>
            <View style={styles.rightBtn}></View>
        </View>)
}

const styles = StyleSheet.create({
    barContainer: {
        width: '100%',
        height: '10%',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#FFB8D0'
    },
    leftBtn: {
        backgroundColor: 'red',
        flex: 1
    },
    rightBtn: {
        backgroundColor: 'blue',
        flex: 1
    }
})