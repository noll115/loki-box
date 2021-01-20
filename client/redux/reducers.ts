import { combineReducers } from "redux";
import { AuthState, AUTH_STATE, SocketState, SOCKET_STATE } from "../types/redux";
import { AuthActions, AuthActionTypes, SocketActions, SocketActionTypes } from "../types/redux";

const INIT_SOCKET_STATE: SocketState = {
    state: SOCKET_STATE.OFFLINE,
    socket: null,
    error: null
}

const INIT_AUTH_STATE: AuthState = {
    state: AUTH_STATE.LOGGING_IN,
    jwtToken: "",
    error: null
}



const SocketReducer = (state = INIT_SOCKET_STATE, action: SocketActions): SocketState => {
    switch (action.type) {
        case SocketActionTypes.SOCKET_CONNECTED:
            return { state: SOCKET_STATE.ONLINE, socket: action.payload.socket, error: null };
        case SocketActionTypes.SOCKET_CONNECTING:
            return { ...state, state: SOCKET_STATE.CONNECTING };
        case SocketActionTypes.SOCKET_DISCONNECTED:
            return { state: SOCKET_STATE.OFFLINE, socket: null, error: action.payload?.error || null };
        default:
            return state;
    }
}


const AuthReducer = (state = INIT_AUTH_STATE, action: AuthActions): AuthState => {
    switch (action.type) {
        case AuthActionTypes.LOGGED_IN:
            return { jwtToken: action.payload.jwtToken, state: AUTH_STATE.LOGGED_IN, error: null }
        case AuthActionTypes.LOGGING_IN:
            return { ...state, state: AUTH_STATE.LOGGING_IN }
        case AuthActionTypes.LOGGED_OUT:
            return { ...state, state: AUTH_STATE.NOT_LOGGED_IN, error: action.payload?.error || null }
        case AuthActionTypes.REMOVE_ERR:
            return { ...state, error: null }
        default:
            return state;
    }
}


export const rootReducer = combineReducers({
    auth: AuthReducer,
    socket: SocketReducer
});