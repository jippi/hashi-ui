import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import rootReducer from './reducers/root';
import eventSaga from './sagas/event'

export default function configureStore(initialState) {
    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(
                sagaMiddleware
            ),
            //
            // Support for Redux DevTools Extension
            // This enables https://github.com/zalmoxisus/redux-devtools-extension
            //
            typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
        )
    )

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers/root', () => {
            const nextRootReducer = require('./reducers/root').default
            store.replaceReducer(nextRootReducer)
        })
    }

    store.runSaga = sagaMiddleware.run
    store.close = () => store.dispatch(END)

    return new Promise((resolve, reject) => {
        eventSaga().then((gen) => {
            sagaMiddleware.run(gen)
            resolve(store);
        })
    })
}
