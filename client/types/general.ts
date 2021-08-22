import { Line, TextData } from "./sketchCanvas";

export interface IBox {
    boxID: string,
    seenAs: string,
    boxName: string
}
export interface IMessageData {
    lines: Line[],
    texts: TextData[]
}

export interface IMessage {
    from: string,
    to: string,
    data: IMessageData,
    seen: boolean,
    sentTime: Date
}