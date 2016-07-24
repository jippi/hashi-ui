import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga'

import rootSaga from './sagas/root'
import rootReducer from './reducers/root';
import Router from './router';

// Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/pe-icon-7-stroke.css';
import '../assets/sass/nomad-ui.scss'

const saga = createSagaMiddleware()
const store = createStore(rootReducer, applyMiddleware(saga))

saga.run(rootSaga)

ReactDOM.render(
    <Provider store={store}>
        <Router />
    </Provider>,
    document.getElementById("app")
);
