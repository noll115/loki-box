import { AntDesign } from "@expo/vector-icons";
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react'
import { useAppSelector } from '../redux';



type Props = { ShowBoxList?: () => void };


const BoxListHeader: React.FC<Props> = ({ ShowBoxList }) => {
    const user = useAppSelector(state => state.user);
    let { boxes, selectedBox } = user;

    if (boxes === null) {
        return null;
    }


    let hasBoxes = boxes.length > 1;

    return (
        <>
            <View style={styles.boxListTitleContainer}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={hasBoxes ? ShowBoxList : undefined}>
                        <View style={styles.boxListTitle}>
                            <Text style={styles.boxListTitleText}>
                                {selectedBox ? selectedBox.boxName : "Add a Box!"}
                            </Text>
                            {hasBoxes && <AntDesign name="caretdown" size={20} style={{ marginLeft: 5 }} color="#2D242B" />}
                        </View>
                    </Pressable>
                </View>
            </View>
        </>
    )
}


export default BoxListHeader;

const styles = StyleSheet.create({
    boxListTitleContainer: {
        paddingTop: StatusBar.currentHeight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: 100,
    },
    boxListTitle: {
        backgroundColor: '#FEF4EA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    boxListTitleText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#2D242B',
    }
})