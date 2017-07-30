import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AppBar from "material-ui/AppBar"
import { withRouter } from "react-router"
import { Tab, Tabs } from "react-toolbox/lib/tabs"
import theme from "./ConsulTopbar.scss"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import FontIcon from "material-ui/FontIcon"
import { FETCH_CONSUL_REGIONS, SET_CONSUL_REGION, APP_DRAWER_OPEN } from "../../sagas/event"
import { CONSUL_COLOR } from "../../config.js"

class ConsulTopbar extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: FETCH_CONSUL_REGIONS
    })
  }

  constructor() {
    super()
    this._onClick = this.handleActive.bind(this)
    this.onChangeRegion = this.handleChangeRegion.bind(this)
  }

  handleChangeRegion(region) {
    this.props.dispatch({
      type: SET_CONSUL_REGION,
      payload: region
    })
  }

  handleActive(index) {
    const prefix = `/consul/${this.props.router.params.region}`
    let route = prefix

    switch (index) {
      case 0:
        route = `${prefix}/services`
        break

      case 1:
        route = `${prefix}/kv`
        break

      case 2:
        route = `${prefix}/nodes`
        break

      default:
        route = `${prefix}/services`
    }

    this.props.router.push(route)
  }

  getActiveTab() {
    const location = this.props.location

    const prefix = `/consul/${this.props.router.params.region}`

    if (location.pathname.startsWith(prefix + "/services")) {
      return 0
    }

    if (location.pathname.startsWith(prefix + "/kv")) {
      return 1
    }

    if (location.pathname.startsWith(prefix + "/nodes")) {
      return 2
    }

    return 0
  }

  consulRegions() {
    if (!Array.isArray(this.props.consulRegions)) {
      return
    }

    return (
      <IconMenu
        iconButtonElement={
          <IconButton>
            <FontIcon className="material-icons">public</FontIcon>
          </IconButton>
        }
        targetOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {this.props.consulRegions.map(region => {
          return <MenuItem primaryText={region} onTouchTap={() => this.onChangeRegion(region)} />
        })}
      </IconMenu>
    )
  }

  tabs() {
    return (
      <Tabs index={this.getActiveTab()} onChange={this._onClick} theme={theme} fixed>
        <Tab label="Services" value="services" />
        <Tab label="Key/Value" value="key-value" />
        <Tab label="Nodes" value="nodes" />
      </Tabs>
    )
  }

  title() {
    let title = "Consul"

    if ("region" in this.props.router.params) {
      title = title + " @ " + this.props.router.params["region"]
    }

    return title
  }

  leftIconClick() {
    this.props.dispatch({ type: APP_DRAWER_OPEN })
  }

  render() {
    const tabs = "region" in this.props.router.params ? this.tabs() : undefined
    return (
      <section style={{ backgroundColor: CONSUL_COLOR }}>
        <AppBar
          title={this.title()}
          showMenuIconButton={window.ENABLED_SERVICES.length > 1}
          iconElementRight={this.consulRegions()}
          onLeftIconButtonTouchTap={() => this.leftIconClick()}
        />
        {tabs}
      </section>
    )
  }
}

ConsulTopbar.defaultProps = {
  consulRegions: []
}

ConsulTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  consulRegions: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps({ consulRegions }) {
  return { consulRegions }
}

export default connect(mapStateToProps)(withRouter(ConsulTopbar))
