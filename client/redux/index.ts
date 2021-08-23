import thunk, { ThunkDispatch, ThunkMiddleware } from 'redux-thunk';
import { rootReducer } from "./reducers"
import { applyMiddleware, createStore, AnyAction } from 'redux';
import { API_URL } from '../constants';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
export * from "./actions";

export type RootState = ReturnType<typeof rootReducer>
const thunkTyped: ThunkMiddleware<RootState, AnyAction, string> = thunk.withExtraArgument(API_URL);
const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkTyped)));



export type RootDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<RootDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;