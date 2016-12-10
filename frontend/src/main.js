import React from 'react'
import ReactDOM from 'react-dom'
import { browserHistory } from 'react-router'
import { Provider } from 'react-redux'

// import Perf from 'react-addons-perf'

import AppRouter from './router'
import configureStore from './store'

import '../assets/hashi-ui.css'

// Perf.start()

configureStore().then((store) => {
  ReactDOM.render(
    <Provider store={ store }>
      <AppRouter history={ browserHistory } />
    </Provider>,
    document.getElementById('app')
   )
}).catch((err) => {
  console.log(err)
})

// window.Perf = Perf
