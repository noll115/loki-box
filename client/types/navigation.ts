import { StackNavigationProp } from '@react-navigation/stack';


export interface RootStackParamList extends Record<string, object | undefined> {
    Login: undefined,
    Register: undefined,
    Home: undefined,
    Splash: undefined
}

export type StackNavProp<RouteName extends keyof RootStackParamList = string> = StackNavigationProp<RootStackParamList, RouteName>

