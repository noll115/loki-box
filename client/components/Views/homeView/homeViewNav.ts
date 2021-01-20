import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs'
export interface HomeViewTabParamList extends Record<string, object | undefined> {
    BoxList: undefined,
    QRScanner: undefined
    AddBox: {
        boxID: string,
        secretToken: string
    }
}

export type TabNavProp<RouteName extends keyof HomeViewTabParamList = string> = MaterialBottomTabNavigationProp<HomeViewTabParamList, RouteName>