import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AppBar from "material-ui/AppBar"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import FontIcon from "material-ui/FontIcon"
import { withRouter } from "react-router"
import { NOMAD_FETCH_REGIONS, NOMAD_SET_REGION, APP_DRAWER_OPEN } from "../../sagas/event"
import { NOMAD_COLOR } from "../../config.js"

class AppTopbar extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: NOMAD_FETCH_REGIONS
    })
  }

  constructor() {
    super()
    this._onChangeNomadRegion = this.handleChangeNomadRegion.bind(this)
  }

  handleChangeNomadRegion(region) {
    this.props.dispatch({
      type: NOMAD_SET_REGION,
      payload: region
    })
  }

  title() {
    let title = "Nomad"

    if ("region" in this.props.router.params) {
      title = title + " @ " + this.props.router.params["region"]
    }

    return title
  }

  nomadRegions() {
    if (!Array.isArray(this.props.nomadRegions)) {
      return
    }

    // don't show region switcher unless there are multiple regions
    if (this.props.nomadRegions.length < 2) {
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
        {this.props.nomadRegions.map(region => {
          return <MenuItem primaryText={region} onTouchTap={() => this._onChangeNomadRegion(region)} />
        })}
      </IconMenu>
    )
  }

  render() {
    return (
      <section style={{ backgroundColor: NOMAD_COLOR }}>
        <AppBar iconElementLeft={<img />} title={this.title()} iconElementRight={this.nomadRegions()} />
      </section>
    )
  }
}

AppTopbar.defaultProps = {
  nomadRegions: []
}

AppTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  nomadRegions: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps({ nomadRegions }) {
  return { nomadRegions }
}

export default connect(mapStateToProps)(withRouter(AppTopbar))
