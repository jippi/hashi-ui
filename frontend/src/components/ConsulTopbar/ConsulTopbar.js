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
import { CONSUL_FETCH_REGIONS, CONSUL_SET_REGION } from "../../sagas/event"
import { CONSUL_COLOR, SITE_TITLE } from "../../config.js"

class ConsulTopbar extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: CONSUL_FETCH_REGIONS
    })
  }

  constructor() {
    super()
    this.onChangeRegion = this.handleChangeRegion.bind(this)
  }

  handleChangeRegion(region) {
    this.props.dispatch({
      type: SET_CONSUL_REGION,
      payload: region
    })
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
          return <MenuItem key={region} primaryText={region} onClick={() => this.onChangeRegion(region)} />
        })}
      </IconMenu>
    )
  }

  title() {
    let title = `${SITE_TITLE} Consul`

    if ("region" in this.props.router.params) {
      title = title + " @ " + this.props.router.params["region"]
    }

    return title
  }

  render() {
    return (
      <section style={{ backgroundColor: CONSUL_COLOR }}>
        <AppBar title={this.title()} iconElementRight={this.consulRegions()} iconElementLeft={<img />} />
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
