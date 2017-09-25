import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import { red500, green800, green900 } from "material-ui/styles/colors"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import AppBar from "material-ui/AppBar"
import Drawer from "material-ui/Drawer"
import Divider from "material-ui/Divider"
import MenuItem from "material-ui/MenuItem"
import FlatButton from "material-ui/FlatButton"
import NomadTopbar from "./NomadTopbar/NomadTopbar"
import NomadMainNav from "./NomadMainNav/NomadMainNav"
import ConsulMainNav from "./ConsulMainNav/ConsulMainNav"
import ConsulTopbar from "./ConsulTopbar/ConsulTopbar"
import NotificationsBar from "./NotificationsBar/NotificationsBar"
import { NOMAD_COLOR, CONSUL_COLOR } from "../config.js"
import { APP_DRAWER_OPEN, APP_DRAWER_CLOSE, CONSUL_UNKNOWN_REGION, NOMAD_UNKNOWN_REGION } from "../sagas/event"

class App extends Component {
  constructor() {
    super()
    this.state = { width: window.innerWidth - 220 }
    window.onresize = this.setW.bind(this)
  }

  setW() {
    this.setState({
      width: window.innerWidth - 220
    })
  }

  changeToApp(e, app) {
    // allow cmd/shift/ctrl key to open link in new tab without changing navigation in current page
    if (
      e.ctrlKey ||
      e.shiftKey ||
      e.metaKey || // apple
      (e.button && e.button == 1) // middle click, >IE9 + everyone else
    ) {
      return false
    }

    // don't trigger the normal href
    e.preventDefault()

    switch (app) {
      case "consul":
        this.props.dispatch({ type: CONSUL_UNKNOWN_REGION })
        break
      case "nomad":
        this.props.dispatch({ type: NOMAD_UNKNOWN_REGION })
        break
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  render() {
    let uncaughtExceptionBar = undefined

    if (this.props.route.uncaughtException) {
      uncaughtExceptionBar = (
        <AppBar
          showMenuIconButton={false}
          style={{ backgroundColor: red500 }}
          title={`Error: ${this.props.route.uncaughtException}`}
        />
      )
    }

    if (Object.keys(this.props.appError).length > 0) {
      const title =
        this.props.appError.error.reason ||
        this.props.appError.reason ||
        "Unhandled application error, please check console"

      uncaughtExceptionBar = <AppBar showMenuIconButton={false} style={{ backgroundColor: red500 }} title={title} />
    }

    const muiTheme = {
      palette: {
        primary1Color: NOMAD_COLOR,
        primary2Color: green800,
        primary3Color: green900
      },
      appBar: {
        height: 50
      }
    }

    let topbar,
      navbar = undefined

    if (this.props.router.location.pathname.startsWith("/consul")) {
      muiTheme.palette.primary1Color = CONSUL_COLOR
      topbar = <ConsulTopbar {...this.props} />
      navbar = <ConsulMainNav {...this.props} />
    }

    if (this.props.router.location.pathname.startsWith("/nomad")) {
      muiTheme.palette.primary1Color = NOMAD_COLOR
      topbar = <NomadTopbar {...this.props} />
      navbar = <NomadMainNav {...this.props} />
    }

    let changeAppBar = null

    if (window.ENABLED_SERVICES.length > 1) {
      changeAppBar = (
        <div style={{ marginTop: 10 }}>
          <FlatButton
            key="switch-to-nomad"
            href="/nomad"
            label=" "
            style={{ width: "50%" }}
            className="nomad-logo"
            onClick={e => {
              this.changeToApp(e, "nomad")
            }}
          />
          <FlatButton
            key="switch-to-consul"
            label=" "
            href="/consul"
            className="consul-logo"
            style={{ width: "50%" }}
            onClick={e => {
              this.changeToApp(e, "consul")
            }}
          />
        </div>
      )
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
        <div>
          <div>
            <NotificationsBar />
            {uncaughtExceptionBar}
          </div>
          <div>{topbar}</div>
          <div>
            <div style={{ float: "left", width: "200px" }}>
              {navbar}
              <Divider />
              {changeAppBar}
              <div
                style={{
                  fontSize: "small",
                  position: "absolute",
                  bottom: 0,
                  color: "grey",
                  width: 200,
                  textAlign: "center"
                }}
              >
                version: {window.GIT_HASH || "webpack-dev"}
              </div>
            </div>
            <div style={{ float: "right", width: this.state.width }}>{this.props.children}</div>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps({ appError, errorNotification, successNotification, appDrawer }) {
  return { appError, errorNotification, successNotification, appDrawer }
}

App.defaultProps = {
  successNotification: undefined,
  errorNotification: undefined,
  appDrawer: false
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  appDrawer: PropTypes.bool.isRequired,
  uncaughtException: PropTypes.object,
  successNotification: PropTypes.object,
  errorNotification: PropTypes.object,
  appError: PropTypes.object,
  route: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(withRouter(App))
