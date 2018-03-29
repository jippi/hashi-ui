import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

import browserHistory from "./history"
import AppRouter from "./router"
import configureStore from "./store"

import "../assets/hashi-ui.css"
import "../assets/hashi-ui.scss"
import "../assets/data-table.css"
import ErrorApp from "./components/error_app"

let retries = 0
let retryInterval

function renderApp(store) {
  clearInterval(retryInterval)
  retryInterval = undefined
  retries = 0

  ReactDOM.render(
    <Provider store={store}>
      <AppRouter history={browserHistory} />
    </Provider>,
    document.getElementById("app")
  )
}

function bootApp() {
  configureStore()
    .then(store => {
      renderApp(store)
    })
    .catch(err => {
      // Start a retry loop if none exist
      if (!retryInterval) {
        retryInterval = window.setInterval(bootApp, 5000)
      }

      retries++

      ReactDOM.render(
        <ErrorApp uncaughtException={err} retryCount={retries} maxRetries={10} />,
        document.getElementById("app")
      )

      throw err
    })
}

bootApp()
