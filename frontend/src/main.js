import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

import rootReducer from './reducers/root';
import Router from './router';
import createSagaMiddleware from 'redux-saga'
import eventSaga from './sagas/event'

// Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/pe-icon-7-stroke.css';
import '../assets/sass/nomad-ui.scss'

const saga = createSagaMiddleware()
const store = createStore(rootReducer, compose(
    applyMiddleware(saga),
    //
    // Support for Redux DevTools Extension
    // This enables https://github.com/zalmoxisus/redux-devtools-extension
    //
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
))

saga.run(eventSaga)

ReactDOM.render(
    <Provider store={store}>
        <Router />
    </Provider>,
    document.getElementById("app")
);
