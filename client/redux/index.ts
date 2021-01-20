import thunk from 'redux-thunk';
import { rootReducer } from "./reducers"
import { applyMiddleware, createStore, compose } from 'redux';
export * from "./actions";

const api = "http://192.168.1.3:3000";


const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk.withExtraArgument(api))));



export type RootState = ReturnType<typeof rootReducer>
export default store;