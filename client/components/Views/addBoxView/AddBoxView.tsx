import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react'
import { Easing, Animated } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from "../../../redux"
import { StackNavProp } from '../homeView/homeViewNav';
import { AddBoxViewParamList } from './addBoxViewNav';
import Prompt from './Prompt';




const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {
}

const connector = connect(mapState, mapDispatch);
type Props = ConnectedProps<typeof connector> & StackNavProp<'AddBox'>



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

const AddBoxView: React.FC<Props> = ({ route, socketState: { socket } }) => {
    let boxInfo = route.params;
    return (
        <Stack.Navigator
            headerMode='none'
            screenOptions={screenOpts}
        >
            <Stack.Screen
                name='boxName'
                options={opts}
                initialParams={{
                    inputTitle: `Who is this box for?`,
                    boxID: boxInfo.boxID,
                    boxName: '',
                    seenAs: '',
                    nextPrompt: 'seenAs'
                }}
                component={Prompt('boxName')}
            />
            <Stack.Screen
                name='seenAs'
                options={opts}
                initialParams={{
                    inputTitle: `Whats the name you want to be seen as?`,
                    nextPrompt: 'submit'
                }}
                component={Prompt('seenAs')}
            />
            <Stack.Screen
                name='submit'
                options={opts}
                component={Prompt('submit', socket!)}
            />
        </Stack.Navigator >
    )

}




export default connector(AddBoxView);