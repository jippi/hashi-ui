import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { Provider } from 'react-redux';
// import Perf from 'react-addons-perf';
import 'bootstrap/dist/css/bootstrap.min.css';

import AppRouter from './router';
import configureStore from './store';

import '../assets/css/pe-icon-7-stroke.css';
import '../assets/sass/nomad-ui.scss';

// Perf.start();

configureStore().then((store) => {
  ReactDOM.render(
    <Provider store={ store }>
      <AppRouter history={ browserHistory } />
    </Provider>,
    document.getElementById('app')
   );
}).catch((err) => {
  console.log(err);
});

// window.Perf = Perf;
