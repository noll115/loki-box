import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React, { useState } from 'react'
import { Easing, Animated } from 'react-native';
import { useAppSelector } from "../../../redux"
import { IBox } from '../../../types/general';
import { StackNavProp } from '../homeView/homeViewNav';
import QRScanner from '../homeView/QRScanner';
import { AddBoxViewParamList, NewBoxContext } from './addBoxViewNav';
import { NamePrompt, SeenAs, Submit } from './Prompt';



const opts: StackNavigationOptions = {
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                easing: Easing.bezier(0.87, 0, 0.13, 1)
            }
        },
        close: {
            animation: 'timing',
            config: {
                easing: Easing.bezier(0.87, 0, 0.13, 1)
            }
        }
    }
}


const Stack = createStackNavigator<AddBoxViewParamList>();

const screenOpts: StackNavigationOptions = {
    cardStyle: {
        backgroundColor: 'transparent',
    },
    cardStyleInterpolator: ({ current, next, layouts: { screen } }) => {
        const progress = Animated.add(
            current.progress,
            next ? next.progress : 0
        )
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: progress.interpolate({
                            inputRange: [0, 1, 2],
                            outputRange: [screen.width, 0, -screen.width]
                        })
                    }
                ]
            }
        }
    }
}


type Props = StackNavProp<'AddBox'>


const AddBoxView: React.FC<Props> = () => {
    const socket = useAppSelector(state => state.socket.socket);
    const [newBoxInfo, changeBoxInfo] = useState<IBox>({ boxID: '', seenAs: '', boxName: '' });
    const changeInfo = (newBoxInfo: Partial<IBox>) => {
        changeBoxInfo(prevState => ({ ...prevState, ...newBoxInfo }));
    }
    return (
        <NewBoxContext.Provider value={{ newBoxInfo, changeBoxInfo: changeInfo }}>
            <Stack.Navigator
                headerMode='none'
                screenOptions={screenOpts}
            >
                <Stack.Screen
                    name='qrScreen'
                    options={opts}
                    component={QRScanner}
                />
                <Stack.Screen
                    name='boxName'
                    options={opts}
                    component={NamePrompt}
                />
                <Stack.Screen
                    name='seenAs'
                    options={opts}
                    component={SeenAs}
                />
                <Stack.Screen
                    name='submit'
                    options={opts}>
                    {(props) => <Submit {...props} socket={socket!} />}
                </Stack.Screen>
            </Stack.Navigator >
        </NewBoxContext.Provider>
    )

}




export default AddBoxView;