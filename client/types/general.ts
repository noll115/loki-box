export interface IBox {
    box: string,
    seenAs: string,
    boxName: string
}

export interface INewBox {
    boxID: string,
    boxName: string,
    seenAs: string
}

export interface IMessage {
    from: string,
    to: string,
    buffer: Buffer,
    seen: boolean,
    sentTime: Date
}