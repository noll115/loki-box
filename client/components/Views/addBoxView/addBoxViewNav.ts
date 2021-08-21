import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { INewBox } from "../../../types/general";


export type AddBoxViewParamList = {
    boxName: undefined
    seenAs: undefined,
    submit: undefined,
    qrScreen: undefined
}


export type AddBoxViewStackProp<RouteName extends keyof AddBoxViewParamList> = StackScreenProps<AddBoxViewParamList, RouteName>

export interface IContextProp {
    newBoxInfo: INewBox,
    changeBoxInfo: (newBoxInfo: Partial<INewBox>) => void
}
export const NewBoxContext = React.createContext<Partial<IContextProp>>({});