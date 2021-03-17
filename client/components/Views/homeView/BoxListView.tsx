import Button from '../../Button';
import { FontAwesome } from "@expo/vector-icons";
import QRScanner, { ScannedBox } from './QRScanner';
import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react'
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


const BoxListView: React.FC<Props> = ({ navigation, user }) => {
    const [viewCam, setViewCam] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    let { boxes, messages, selectedBox } = user;
    useEffect(() => {
        let removeListener = navigation.addListener('focus', () => {
            setBtnDisabled(false);
        });
        return removeListener;
    }, [])

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



    let drawerMenuBtns = {
        'Add a box':
        {
            fn: () => setViewCam(true),
            icon: () => <FontAwesome name="plus" size={35} color="#171216" />
        }
    }




    return (
        <>
            <BoxListHeader />
            {selectedBox && <MessageList selectedBox={selectedBox} messages={messages} />}
            <View style={styles.sendMsgBtn}>
                {selectedBox &&
                    <Button
                        title={'Send a Message'}
                        icon={<FontAwesome name="heart" size={20} color="#FEF4EA" />}
                        isDisabled={btnDisabled}
                        onPress={() => {
                            setBtnDisabled(true);
                            navigation.push('SendMessage', {
                                box: selectedBox!
                            })
                        }} btnStyle={{ flex: 1, marginHorizontal: 20, borderRadius: 50, elevation: 4 }} />
                }
            </View>
            <QRScanner onScan={OnScanBox} showCam={viewCam} onClose={OnCloseScanner} />
            <DrawerMenu btns={drawerMenuBtns} />

        </>
    )
}


export default connector(BoxListView)

const styles = StyleSheet.create({
    sendMsgBtn: {
        flexDirection: 'row',
        position: 'absolute',
        width: '100%',
        height: 70,
        bottom: '4%',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0
    }
})