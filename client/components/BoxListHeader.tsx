import { AntDesign } from "@expo/vector-icons";
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react'
import { RootState } from '../redux';
import { connect, ConnectedProps } from 'react-redux';
import { TouchableOpacity } from "react-native-gesture-handler";

const mapState = (state: RootState) => ({
    user: state.user
})

const mapDispatch = {
}

const connector = connect(mapState, mapDispatch);

type Props = { onOpenBoxMenu(): void } & ConnectedProps<typeof connector>


const BoxListHeader: React.FC<Props> = ({ user, onOpenBoxMenu }) => {
    let { boxes, selectedBox } = user;


    if (boxes === null) {
        return null
    }


    let hasBoxes = boxes.length > 1;
    return (
        <>
            <View style={styles.boxListTitle}>
                <View style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={hasBoxes ? onOpenBoxMenu : undefined}>
                        <Text style={styles.boxListTitleText}>
                            {selectedBox ? selectedBox.boxName : "Add a Box!"}
                        </Text>
                        {boxes.length > 1 && <AntDesign name="caretdown" size={25} style={{ marginLeft: 10 }} color="#FFCABE" />}
                    </TouchableOpacity>

                </View>
            </View>

        </>
    )
}


export default connector(BoxListHeader)

const styles = StyleSheet.create({
    boxListTitle: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#485696',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '13%'
    },
    boxListTitleText: {
        paddingTop: '4%',
        fontSize: 30,
        paddingBottom: '4%',
        fontWeight: 'bold',
        color: '#FFCABE',
    }
})