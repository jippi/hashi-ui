import FontIcon from "material-ui/FontIcon"
import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import { withRouter } from "react-router"

const infoIcon = <FontIcon className="material-icons">info_outline</FontIcon>
const allocationIcon = <FontIcon className="material-icons">apps</FontIcon>
const evaluationIcon = <FontIcon className="material-icons">share</FontIcon>
const taskGroupIcon = <FontIcon className="material-icons">layers</FontIcon>
const rawIcon = <FontIcon className="material-icons">code</FontIcon>

class _DeploymentTopbar extends PureComponent {
  handleActive(tab) {
    const path = ["", "nomad", this.props.router.params.region, "deployments", this.props.deployment.ID, tab]
    this.props.router.push(path.map(encodeURIComponent).join("/"))
  }

  getActiveTab() {
    const location = this.props.location
    const end = location.pathname.split("/").pop()

    if (end.startsWith("info")) {
      return 0
    }

    if (end.startsWith("allocations")) {
      return 1
    }

    if (end.startsWith("raw")) {
      return 2
    }

    return 0
  }

  getStyle() {
    return {
      borderBottom: "1px solid #e0e0e0",
      marginBottom: 10
    }
  }

  render() {
    return (
      <BottomNavigation showLabels value={this.getActiveTab()} style={this.getStyle()}>
        <BottomNavigationAction label="Info" icon={infoIcon} onClick={() => this.handleActive("info")} />
        <BottomNavigationAction
          label="Allocations"
          icon={allocationIcon}
          onClick={() => this.handleActive("allocations")}
        />
        <BottomNavigationAction label="Raw" icon={rawIcon} onClick={() => this.handleActive("raw")} />
      </BottomNavigation>
    )
  }
}

_DeploymentTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  deployment: PropTypes.object.isRequired
}

const ViewDeploymentTopbar = withRouter(_DeploymentTopbar)

export default ViewDeploymentTopbar
