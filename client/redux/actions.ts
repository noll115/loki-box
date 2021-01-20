import { AuthActions, AuthActionTypes, SocketActionTypes, ThunkAuthAction, ThunkSocketAction } from "../types/redux"
import { io } from "socket.io-client";
import * as secureStore from "expo-secure-store";



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
            return dispatch({ type: AuthActionTypes.LOGGED_IN, payload: { jwtToken: json.jwtToken } })

        } catch (err) {
            console.log(err);
            dispatch(AuthError("Something went wrong"))
        }
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

export const ConnectSocket = (): ThunkSocketAction => {
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
        socket.on('connect_error', (err: Error) => {
            console.log(`connect ERROR | ${err.message}`);
            dispatch({
                type: SocketActionTypes.SOCKET_DISCONNECTED,
                payload: {
                    error: err.message
                }
            })
        });
        socket.on('disconnect', () => {
            console.log("disconnected");
            dispatch({
                type: SocketActionTypes.SOCKET_DISCONNECTED
            })
        })
    }
}

