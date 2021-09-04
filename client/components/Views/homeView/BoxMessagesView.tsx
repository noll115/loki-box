import Button from '../../Button';
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react'
import { StackNavProp } from './homeViewNav';
import { useAppSelector } from '../../../redux';
import BoxListHeader from '../../BoxListHeader';
import DrawerMenu from '../../DrawerMenu';
import { MessageList } from '../../MessageList';
import { BoxList } from './BoxList';



type Props = StackNavProp<'BoxMessages'>


const BoxMessagesView: React.FC<Props> = ({ navigation }) => {
    const [btnDisabled, setBtnDisabled] = useState(false);
    let { boxes, messages, selectedBox } = useAppSelector(state => state.user);
    const [showBoxList, setShowBoxList] = useState(false);

    useEffect(() => {
        let removeListener = navigation.addListener('focus', () => {
            setBtnDisabled(false);
        });
        return removeListener;
    }, [])

    if (!boxes)
        return null;


    const ShowBoxList = () => {
        setShowBoxList(true);
    }

    const hideBoxList = () => {
        setShowBoxList(false);
    }

    let drawerMenuBtns = {
        'Add a box':
        {
            fn: () => navigation.push('AddBox'),
            icon: () => <FontAwesome name="plus" size={35} color="#171216" />
        }
    }

    return (
        <>
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
                        }} btnStyle={{ flex: 1, marginHorizontal: 20, borderRadius: 50 }} />
                }
            </View>
            <BoxListHeader ShowBoxList={ShowBoxList} />
            <BoxList boxListOpen={showBoxList} hideBoxList={hideBoxList} />
            <DrawerMenu btns={drawerMenuBtns} />

        </>
    )
}


export default BoxMessagesView;

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
    }
})