import thunk from 'redux-thunk';
import { rootReducer } from "./reducers"
import { applyMiddleware, createStore, compose } from 'redux';
import { API_URL } from '../constants';
export * from "./actions";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk.withExtraArgument(API_URL))));



export type RootState = ReturnType<typeof rootReducer>
export default store;