import { Socket } from "socket.io-client";
import { Action } from "redux"
import { RootState } from "../redux";
import { ThunkAction } from "redux-thunk";
export enum SOCKET_STATE {
    ONLINE = "ONLINE",
    CONNECTING = "CONNECTING",
    OFFLINE = "OFFLINE"
}

export enum AUTH_STATE {
    LOGGED_IN = "LOGGED_IN",
    LOGGING_IN = "LOGGING_IN",
    NOT_LOGGED_IN = "NOT_LOGGED_IN"
}


export type SocketState = {
    state: SOCKET_STATE,
    socket: Socket | null,
    error: string | null;
}

export interface AuthState {
    state: AUTH_STATE,
    jwtToken: string
    error: string | null
}

export enum AuthActionTypes {
    FINDING_TOKEN = "FINDING_TOKEN",
    LOGGED_IN = "LOGGED_IN",
    LOGGING_IN = "LOGGING_IN",
    LOGGED_OUT = "LOGGED_OUT",
    REMOVE_ERR = "REMOVE_ERR"
}

interface FindingToken extends Action<AuthActionTypes.FINDING_TOKEN> { }

interface LoggingIn extends Action<AuthActionTypes.LOGGING_IN> { }

interface LoggedIn extends Action<AuthActionTypes.LOGGED_IN> {
    payload: {
        jwtToken: string
    }
}

interface LoggedOut extends Action<AuthActionTypes.LOGGED_OUT> {
    payload?: {
        error: string
    }
}

interface RemoveError extends Action<AuthActionTypes.REMOVE_ERR> { }

export type AuthActions = LoggingIn | LoggedIn | LoggedOut | FindingToken | RemoveError;
export type ThunkAuthAction = ThunkAction<void, RootState, string, AuthActions>;

/*--------------------------------------------------------------------------------*/

export enum SocketActionTypes {
    SOCKET_CONNECTED = "ASSIGN_SOCKET",
    SOCKET_CONNECTING = "SOCKET_CONNECTING",
    SOCKET_DISCONNECTED = "SOCKET_DISCONNECTED"
}


interface SocketConnected extends Action<SocketActionTypes.SOCKET_CONNECTED> {
    payload: {
        socket: Socket
    }
}
interface SocketConnecting extends Action<SocketActionTypes.SOCKET_CONNECTING> {
}
interface SocketDisconnected extends Action<SocketActionTypes.SOCKET_DISCONNECTED> {
    payload?: {
        error: string
    }
}


export type SocketActions = SocketConnected | SocketConnecting | SocketDisconnected;
export type ThunkSocketAction = ThunkAction<void, RootState, string, SocketActions>