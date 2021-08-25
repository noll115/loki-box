import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { IBox } from "../../../types/general";


export type AddBoxViewParamList = {
    boxName: undefined
    seenAs: undefined,
    submit: undefined,
    qrScreen: undefined,
    BoxMessages: undefined
}


export type AddBoxViewStackProp<RouteName extends keyof AddBoxViewParamList> = StackScreenProps<AddBoxViewParamList, RouteName>

export interface IContextProp {
    newBoxInfo: IBox,
    changeBoxInfo: (newBoxInfo: Partial<IBox>) => void
}
export const NewBoxContext = React.createContext<Partial<IContextProp>>({});