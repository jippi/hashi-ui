import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import { red500, green800, green900 } from "material-ui/styles/colors"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import AppBar from "material-ui/AppBar"
import Drawer from "material-ui/Drawer"
import MenuItem from "material-ui/MenuItem"
import ReactTooltip from "react-tooltip"
import NomadTopbar from "./NomadTopbar/NomadTopbar"
import NomadMainNav from "./NomadMainNav/NomadMainNav"
import ConsulTopbar from "./ConsulTopbar/ConsulTopbar"
import NotificationsBar from "./NotificationsBar/NotificationsBar"
import { NOMAD_COLOR, CONSUL_COLOR } from "../config.js"
import { APP_DRAWER_OPEN, APP_DRAWER_CLOSE, UNKNOWN_CONSUL_REGION, UNKNOWN_NOMAD_REGION } from "../sagas/event"

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

  DrawerRequestedChange(open) {
    if (!open) {
      this.props.dispatch({ type: APP_DRAWER_CLOSE })
    } else {
      this.props.dispatch({ type: APP_DRAWER_OPEN })
    }
  }

  changeToApp(app) {
    this.props.dispatch({ type: APP_DRAWER_CLOSE })

    switch (app) {
      case "consul":
        this.props.dispatch({ type: UNKNOWN_CONSUL_REGION })
        break
      case "nomad":
        this.props.dispatch({ type: UNKNOWN_NOMAD_REGION })
        break
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  appDrawer() {
    if (window.ENABLED_SERVICES.length < 2) {
      return null
    }

    return (
      <Drawer
        docked={false}
        open={this.props.appDrawer}
        onRequestChange={open => {
          this.DrawerRequestedChange(open)
        }}
      >
        {window.ENABLED_SERVICES.map(service => {
          return (
            <MenuItem
              key={service}
              onTouchTap={() => {
                this.changeToApp(service)
              }}
            >
              {this.capitalizeFirstLetter(service)}
            </MenuItem>
          )
        })}
      </Drawer>
    )
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
    }

    if (this.props.router.location.pathname.startsWith("/nomad")) {
      muiTheme.palette.primary1Color = NOMAD_COLOR
      topbar = <NomadTopbar {...this.props} />
      navbar = <NomadMainNav {...this.props} />
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
        <div>
          <div>
            {this.appDrawer()}
            <NotificationsBar />
            {uncaughtExceptionBar}
          </div>
          <div>
            {topbar}
          </div>
          <div>
            <div style={{ float: "left", width: "200px" }}>
              {navbar}
            </div>
            <div style={{ float: "right", width: this.state.width }}>
              {this.props.children}
              <ReactTooltip />
            </div>
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
