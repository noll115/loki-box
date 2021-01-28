import { TouchableOpacity } from 'react-native-gesture-handler';
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { StatusBar, StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { RootState, Logout } from '../redux';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
    Logout
}

const connector = connect(mapState, mapDispatch);

type Props = { btns: Record<string, { fn: () => void, icon: React.FC }> } & ConnectedProps<typeof connector>

let sizeofDrawer = 0.8

let windowWidth = Dimensions.get('window').width;

const DrawerMenu: React.FC<Props> = ({ user, btns, Logout }) => {

    const slideInAnim = useRef(new Animated.Value(0)).current;
    const [openDrawer, setOpenDrawer] = useState(false);

    useEffect(() => {
        Animated.timing(slideInAnim, {
            toValue: openDrawer ? 1 : 0,
            duration: 250,
            useNativeDriver: true
        }).start()
    }, [openDrawer]);

    let bodyBtns: JSX.Element[] = []
    for (const key in btns) {
        let Icon = btns[key].icon;
        let funcWrap = () => {
            setOpenDrawer(false);
            btns[key].fn()
        }
        bodyBtns.push(
            <TouchableOpacity key={key} onPress={funcWrap} style={styles.bodyBtnContainer}>
                <View style={styles.bodyBtn}>
                    <Icon />
                    <Text style={styles.bodyBtnText}>Add a box</Text>
                </View>
            </TouchableOpacity>
        )
    }


    return (
        <Animated.View
            style={[styles.drawerContainer,
            {
                transform: [{
                    translateX: slideInAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-windowWidth, 0]
                    }),
                }]
            }]}>
            <View style={styles.drawer}>

                <View style={[styles.drawerHeader]}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <AntDesign name="hearto" size={120} color="#171216" />
                        <Feather style={{ position: 'absolute' }} name="box" size={60} color="#171216" />
                    </View>
                    <Text style={styles.userEmail}>My account</Text>
                </View>
                <Animated.View style={[styles.folderBtn, {
                    transform: [
                        {
                            translateX: slideInAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [windowWidth * 0.35, 0]
                            }),
                        }
                    ]
                }]}>
                    <TouchableOpacity
                        onPress={() => setOpenDrawer(prev => !prev)}
                        style={{
                            height: '100%',
                            paddingRight: '7%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <AntDesign name={openDrawer ? 'menu-unfold' : 'menu-fold'} size={30} style={{ marginLeft: 10 }} color="#FFCABE" />
                    </TouchableOpacity >
                </Animated.View>
                <View style={styles.drawerBody}>
                    {bodyBtns}
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        marginBottom: 25
                    }} >
                        <TouchableOpacity onPress={Logout} style={styles.bodyBtnContainer}>
                            <View style={styles.bodyBtn}>
                                <FontAwesome name="sign-out" size={35} color="#171216" />
                                <Text style={styles.bodyBtnText}>Sign out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View >

    )
}

export default connector(DrawerMenu)

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'transparent',
        width: '100%',
    },
    drawer: {
        width: windowWidth * sizeofDrawer,
        backgroundColor: '#FFCABE',
        shadowColor: "#000",
        height: '100%',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,
    },
    drawerHeader: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#485696',
        flex: 0.25
    },
    drawerBody: {
        flex: 0.75
    },
    userEmail: {
        alignSelf: 'center',
        paddingLeft: 20,
        fontSize: 30,
    },
    bodyBtnContainer: {
        paddingVertical: 30,
    },
    bodyBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    bodyBtnText: {
        paddingLeft: 15,
        fontSize: 20,
        color: '#171216'
    },
    folderBtn: {
        position: 'absolute',
        height: '13%',
        paddingTop: StatusBar.currentHeight,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    }
})