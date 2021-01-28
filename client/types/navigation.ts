import { StackScreenProps } from '@react-navigation/stack';


export type RootStackParamList = {
    Login: undefined,
    Register: undefined,
    Home: undefined,
    Splash: undefined
}

export type StackNavProp<RouteName extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, RouteName>

