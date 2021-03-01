import { AuthActions, AuthActionTypes, SocketActions, SocketActionTypes, ThunkAuthAction, UserActions, UserActionTypes } from "../types/redux"
import { io } from "socket.io-client";
import * as secureStore from "expo-secure-store";
import { RootState } from ".";
import { ThunkAction } from "redux-thunk";
import { IBox, IMessage } from "../types/general";



const AuthError = (error: string): AuthActions => ({
    type: AuthActionTypes.LOGGED_OUT,
    payload: {
        error
    }
})



export const Login = (email: string, pass: string): ThunkAuthAction => {
    return async (dispatch, getState, api) => {
        dispatch({ type: AuthActionTypes.LOGGING_IN });

        try {
            let res = await fetch(`${api}/user/login`, {
                method: "POST",
                body: JSON.stringify({ email, pass }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (res.status !== 200) {
                let text = await res.text();
                return dispatch(AuthError(text));
            }
            let json = await (res.json() as Promise<{ jwtToken: string }>);
            await secureStore.setItemAsync('jwtToken', json.jwtToken);
            return dispatch({
                type: AuthActionTypes.LOGGED_IN,
                payload: { jwtToken: json.jwtToken }
            })

        } catch (err) {
            console.log(err);
            dispatch(AuthError("Something went wrong"))
        }
    }
}


export const Logout = (): ThunkAuthAction => {
    return async (dispatch, getState, api) => {
        await secureStore.deleteItemAsync('jwtToken');
        getState().socket.socket?.disconnect()
        return dispatch({ type: AuthActionTypes.LOGGED_OUT })
    }
}


export const GetTokenInStorage = (): ThunkAuthAction => {
    return async (dispatch) => {
        let jwtToken = await secureStore.getItemAsync('jwtToken');
        if (jwtToken) {
            return dispatch({
                type: AuthActionTypes.LOGGED_IN,
                payload: {
                    jwtToken
                }
            })
        }
        dispatch({
            type: AuthActionTypes.LOGGED_OUT
        })
    }
}



export const Register = (email: string, pass: string): ThunkAuthAction => {
    return async (dispatch, getState, api) => {
        dispatch({ type: AuthActionTypes.LOGGING_IN });
        try {
            let res = await fetch(`${api}/user/register`, {
                method: "POST",
                body: JSON.stringify({ email, pass }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (res.status !== 200) {
                let text = await res.text();
                console.log(text);
                return dispatch(AuthError(text));
            }
            let json = await (res.json() as Promise<{ jwtToken: string }>);
            await secureStore.setItemAsync('jwtToken', json.jwtToken);
            return dispatch({ type: AuthActionTypes.LOGGED_IN, payload: { jwtToken: json.jwtToken } })

        } catch (err) {
            console.log(err);
            return dispatch(AuthError("Something went wrong"));
        }
    }
}

export const RemoveError = () => ({
    type: AuthActionTypes.REMOVE_ERR
});

export const ConnectSocket = (): ThunkAction<void, RootState, string, SocketActions | UserActions> => {
    return async (dispatch, getState, api) => {
        let jwt = getState().auth.jwtToken;
        dispatch({
            type: SocketActionTypes.SOCKET_CONNECTING
        })

        let socket = io(`${api}/user`, {
            extraHeaders: {
                authorization: `Bearer ${jwt}`
            },
            transports: ['websocket'],
        });
        socket.on('connect', () => {
            dispatch({
                type: SocketActionTypes.SOCKET_CONNECTED,
                payload: {
                    socket
                }
            })

        });
        socket.on('boxes', (boxes: IBox[]) => {

            let hasPrevSelected = getState().user.selectedBox;
            if (boxes.length > 0 && !hasPrevSelected) {
                socket.emit('getMsgHistory', boxes[0].box, res => {
                    if (res.status === 'ok') {
                        dispatch({
                            type: UserActionTypes.UPDATE_BOXES,
                            payload: {
                                boxes,
                                selectedBox: boxes[0],
                                messages: res.msgs.map(msg => ({ ...msg, sentTime: new Date(msg.sentTime) }))
                            }
                        })
                    }
                })
            } else {
                dispatch({
                    type: UserActionTypes.UPDATE_BOXES,
                    payload: {
                        boxes
                    }
                })
            }
        })
        socket.on('connect_error', (err: Error) => {
            dispatch({
                type: SocketActionTypes.SOCKET_DISCONNECTED,
                payload: {
                    error: err.message
                }
            })
        });
        socket.on('jwt failed', () => {
            dispatch(Logout());
        })
        socket.on('disconnect', () => {
            console.log("disconnected");
            dispatch({
                type: SocketActionTypes.SOCKET_DISCONNECTED
            })
        })
    }
}

export const SelectBox = (box: IBox): ThunkAction<Promise<void>, RootState, string, UserActions> => {
    return async (dispatch, getState) => {
        return dispatch(RefreshMessages(box))
    }
}


export const RefreshMessages = (box?: IBox): ThunkAction<Promise<void>, RootState, string, UserActions> => {
    return async (dispatch, getState) => {
        return new Promise((res, rej) => {
            let { socket: socketState, user } = getState();
            let { socket } = socketState;
            let selectedBox = box || user.selectedBox;
            if (socket && selectedBox)
                socket.emit('getMsgHistory', selectedBox.box, data => {
                    
                    if (data.status === 'ok') {
                        console.log(data.msgs);
                        dispatch({
                            type: UserActionTypes.SELECT_BOX,
                            payload: {
                                box: selectedBox!,
                                messages: data.msgs.map(msg => ({ ...msg, sentTime: new Date(msg.sentTime) }))
                            }
                        })
                        return res()
                    }
                    rej()
                })
        })

    }
}

