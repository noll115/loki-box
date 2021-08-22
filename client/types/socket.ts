import { IBox, IMessage, IMessageData } from "./general";

interface socketStatus {
    status: 'ok' | 'failed'
}

interface getMsgSuccess extends socketStatus {
    status: 'ok',
    msgs: IMessage[]
}
interface getMsgFailed extends socketStatus {
    status: 'failed'
}

type getMsgStatus = getMsgSuccess | getMsgFailed;


declare module 'socket.io-client' {
    interface Socket {
        emit(str: 'getBoxes', cb: (newBoxes: IMessage[]) => void): void
        emit(str: 'registerBox', newBox: IBox, cb: (res: socketStatus) => void): void
        emit(str: 'sendMsg', boxID: string, msg: IMessageData, cb: (res: socketStatus) => void): void
        emit(str: 'removeBox', boxID: string, cb: (res: socketStatus) => void): void
        emit(str: 'getMsgHistory', boxID: string, cb: (res: getMsgStatus) => void): void
    }
}
