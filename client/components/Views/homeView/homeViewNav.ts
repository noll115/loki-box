import { StackScreenProps } from '@react-navigation/stack'
import { IBox } from '../../../types/general'


export type HomeViewTabParamList = {
    BoxList: undefined,
    AddBox: {
        boxID: string,
    },
    SendMessage: {
        box: IBox
    }
}

export type StackNavProp<RouteName extends keyof HomeViewTabParamList> = StackScreenProps<HomeViewTabParamList, RouteName>

