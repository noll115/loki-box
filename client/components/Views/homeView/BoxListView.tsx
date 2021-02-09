import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Button from '../../Button';
import { Feather, FontAwesome } from "@expo/vector-icons";
import QRScanner, { ScannedBox } from './QRScanner';
import { StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { StackNavProp } from './homeViewNav';
import { RootState, SelectBox } from '../../../redux';
import { connect, ConnectedProps } from 'react-redux';
import BoxListHeader from '../../BoxListHeader';
import DrawerMenu from '../../DrawerMenu';
import { MessageList } from '../../MessageList';


const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
    SelectBox
}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & StackNavProp<'BoxList'>


const BoxListView: React.FC<Props> = ({ navigation, user, SelectBox }) => {
    const [viewCam, setViewCam] = useState(false);
    let { boxes, messages, selectedBox } = user;
    const [BoxMenuOpen, setBoxMenuOpen] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (BoxMenuOpen) {
            Animated.timing(fadeAnim, {
                duration: 250,
                toValue: 1,
                useNativeDriver: true
            }).start()
        }
    }, [BoxMenuOpen])

    if (!boxes)
        return null;



    const OnScanBox = (box: ScannedBox) => {
        console.log(box);
        setViewCam(false)
        navigation.navigate('AddBox', {
            boxID: box.boxID
        });
    }

    const OnCloseScanner = () => {
        setViewCam(false);
    }



    const closeMenu = () => {
        Animated.timing(fadeAnim, {
            duration: 250,
            toValue: 0,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished)
                setBoxMenuOpen(false);
        })
    }

    let menuItems = boxes.map((box, index) => {
        let isFirst = index === 0;
        if (box.box === selectedBox?.box) {
            return null;
        }
        return (
            <View key={index}>
                { !isFirst && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#2d242b' }}></View>}
                <TouchableOpacity
                    style={styles.boxMenuItems}
                    onPress={() => {
                        SelectBox(box);
                    }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize' }}>{box.boxName}</Text>
                </TouchableOpacity>
            </View>
        )

    });

    let drawerMenuBtns = {
        'Add a box':
        {
            fn: () => setViewCam(true),
            icon: () => <FontAwesome name="plus" size={35} color="#171216" />
        }
    }




    return (
        <>
            <BoxListHeader onOpenBoxMenu={() => setBoxMenuOpen(true)} />
            {selectedBox && <MessageList selectedBox={selectedBox} messages={messages} />}
            <View style={{ flexDirection: 'row', position: 'absolute', width: '100%', height: 70, bottom: '4%', paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
                {selectedBox && <Button title='Send a Message' onPress={() => {
                    navigation.navigate('SendMessage', {
                        box: selectedBox!
                    })
                }} btnStyle={{ flex: 1, marginHorizontal: 20 }} />}
            </View>
            <QRScanner onScan={OnScanBox} showCam={viewCam} onClose={OnCloseScanner} />
            <DrawerMenu btns={drawerMenuBtns} />
            {BoxMenuOpen &&
                <Animated.View style={[styles.boxMenu, { opacity: fadeAnim }]}>
                    <View style={{ padding: 15, backgroundColor: '#FEF4EA', borderRadius: 10, width: '75%', height: '50%' }}>
                        <TouchableOpacity onPress={closeMenu}>
                            <Feather name='x' size={30} color='#2d242b' style={{ marginVertical: 5 }} />
                        </TouchableOpacity>
                        <ScrollView>
                            {menuItems}
                        </ScrollView>
                    </View>
                </Animated.View>
            }
        </>
    )
}


export default connector(BoxListView)

const styles = StyleSheet.create({
    floatingBtn: {
        bottom: '5%',
        left: '5%',
        borderRadius: 50,
        flex: 1
    },
    firstBox: {
        marginTop: 30
    },
    boxMenu: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(45, 36, 43,0.4)',
    },
    boxMenuItems: {
        paddingHorizontal: 5,
        paddingVertical: 20,
    },
})