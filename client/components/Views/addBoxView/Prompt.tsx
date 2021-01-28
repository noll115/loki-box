import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Socket } from 'socket.io-client';
import validator from 'validator';
import { INewBox } from '../../../types/general';
import Button from '../../Button';
import { AddBoxViewParamList, AddBoxViewStackProp, IRouteParams } from './addBoxViewNav';



type Props = {

}

const nextRoute: { [x in keyof Omit<AddBoxViewParamList, 'submit'>]: keyof AddBoxViewParamList } = {
    boxName: 'seenAs',
    seenAs: 'submit'
}



type PromptType = (typeOfPrompt: keyof AddBoxViewParamList, socket?: Socket) => React.FC<Props & AddBoxViewStackProp<typeof typeOfPrompt>>



const validateInput = (input: string): boolean => {
    return validator.matches(input, /^[a-zA-Z\-\s]+$/) && validator.isLength(input, { max: 20, min: 1 })
}

const Prompt: PromptType = (typeOfPrompt, socket) => {
    if (typeOfPrompt === 'submit') {
        return ({ navigation, route }) => {
            const nav = useNavigation();

            useEffect(() => {
                let unsub = navigation.addListener('beforeRemove', async () => {
                    let { boxID, boxName, seenAs } = route.params;

                    let newBox: INewBox = {
                        boxID,
                        boxName,
                        seenAs
                    }
                    socket?.emit('registerBox', newBox, (res) => {
                        console.log(newBox);
                        console.log(res);
                    })
                })
                return unsub;
            }, [navigation, socket])
            let { boxName, seenAs } = route.params;
            return (
                <View style={styles.container}>
                    <View style={styles.inputPromptContainer}>
                        <View style={styles.inputPrompt}>
                            <Text style={{ fontSize: 20 }}>
                                This is for: <Text style={{ fontWeight: 'bold' }}>{boxName}</Text>
                            </Text>
                            <Text style={{ fontSize: 20, paddingTop: 30 }}>
                                I want to be seen as: <Text style={{ fontWeight: 'bold' }}>{seenAs}</Text>
                            </Text>
                        </View>
                        <Button title='Add Box' onPress={() => nav.navigate("BoxList")} />
                    </View>
                </View>
            )
        };
    }
    return ({ navigation, route }) => {
        let { inputTitle, nextPrompt, ...boxInfo } = route.params as IRouteParams;
        const [text, setText] = useState(boxInfo[typeOfPrompt]);
        const inputRef = useRef<TextInput>(null);
        useEffect(() => {
            inputRef.current?.focus();
        }, [inputRef])

        const handleOnPress = () => {
            if (validateInput(text))
                navigation.push(nextPrompt, {
                    ...boxInfo,
                    boxID: boxInfo.boxID,
                    [typeOfPrompt]: text,
                })
        }

        return (
            <View style={styles.container}>
                <View style={styles.inputPromptContainer}>
                    <View style={styles.inputPrompt}>
                        <Text style={{ fontSize: 20 }}>{inputTitle}</Text>
                        <TextInput
                            maxLength={20}
                            ref={inputRef}
                            value={text}
                            onChangeText={txt => { setText(txt) }}
                            style={{ fontSize: 25, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 10 }}
                        />
                    </View>
                    <Button title='Next' onPress={handleOnPress} />
                </View>
            </View>
        )
    }
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

export default Prompt;