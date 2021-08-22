import React, { useContext } from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Socket } from 'socket.io-client';
import validator from 'validator';
import Button from '../../Button';
import { AddBoxViewStackProp, IContextProp, NewBoxContext } from './addBoxViewNav';





const validateInput = (input: string): boolean => {
    return validator.matches(input, /^[a-zA-Z\-\s]+$/) && validator.isLength(input, { max: 20, min: 1 })
}

const NamePrompt: React.FC<AddBoxViewStackProp<'boxName'>> = ({ navigation }) => {

    const handleOnPress = () => {
        navigation.push('seenAs');
    }

    const { newBoxInfo, changeBoxInfo } = useContext(NewBoxContext) as IContextProp;
    return (
        <View style={styles.container}>
            <View style={styles.inputPromptContainer}>
                <View style={styles.inputPrompt}>
                    <Text style={{ fontSize: 20 }}>What is the box's name?</Text>
                    <TextInput
                        maxLength={20}
                        value={newBoxInfo?.boxName}
                        onChangeText={txt => {
                            changeBoxInfo({ boxName: txt });
                        }}
                        style={{ fontSize: 25, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 10 }}
                    />
                </View>
                <Button title='Next' onPress={handleOnPress} />
            </View>
        </View>
    )
}


const SeenAs: React.FC<AddBoxViewStackProp<'seenAs'>> = ({ navigation }) => {
    const { newBoxInfo, changeBoxInfo } = useContext(NewBoxContext) as IContextProp;
    const handleOnPress = () => {
        navigation.push('submit');
    }
    return (
        <View style={styles.container}>
            <View style={styles.inputPromptContainer}>
                <View style={styles.inputPrompt}>
                    <Text style={{ fontSize: 20 }}>What name do you want to be seen as?</Text>
                    <TextInput
                        maxLength={20}
                        value={newBoxInfo.seenAs}
                        onChangeText={txt => {
                            changeBoxInfo({ seenAs: txt });
                        }}
                        style={{ fontSize: 25, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 10 }}
                    />
                </View>
                <Button title='Next' onPress={handleOnPress} />
            </View>
        </View>
    )
}

type Props = {
    socket: Socket
}

const Submit: React.FC<Props & AddBoxViewStackProp<'submit'>> = ({ navigation, socket }) => {
    const { newBoxInfo } = useContext(NewBoxContext) as IContextProp;
    const handleOnPress = () => {
        socket.emit('registerBox', newBoxInfo, (res) => {
            if (res.status === 'ok') {
                navigation.navigate('BoxList');
            }
        })
    }
    return (
        <View style={styles.container}>
            <View style={styles.inputPromptContainer}>
                <View style={styles.inputPrompt}>
                    <Text style={{ fontSize: 20 }}>Box's name: {newBoxInfo.boxName}</Text>
                    <Text style={{ fontSize: 20 }}>They will see you as: {newBoxInfo.seenAs}</Text>
                </View>
                <Button title='Add Box' onPress={handleOnPress} />
            </View>
        </View>
    )
}



const styles = StyleSheet.create({
    inputPromptContainer: {
        backgroundColor: '#FEF4EA',
        marginHorizontal: 30,
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.43,
        shadowRadius: 9.51,
        elevation: 15,
    },
    inputPrompt: {
        paddingVertical: 20,
        marginBottom: 30
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    }

})

export { NamePrompt, SeenAs, Submit };