import { StackScreenProps } from "@react-navigation/stack";
import { INewBox } from "../../../types/general";


export interface IRouteParams extends INewBox {
    inputTitle?: string,
    nextPrompt: keyof AddBoxViewParamList
}

export type AddBoxViewParamList = {
    [x in keyof Omit<INewBox, 'boxID'>]: IRouteParams
} & { submit: INewBox }




export type AddBoxViewStackProp<RouteName extends keyof AddBoxViewParamList> = StackScreenProps<AddBoxViewParamList, RouteName>
