import FontIcon from "material-ui/FontIcon"
import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import { withRouter } from "react-router"

const infoIcon = <FontIcon className="material-icons">info_outline</FontIcon>
const allocationIcon = <FontIcon className="material-icons">apps</FontIcon>
const executionIcon = <FontIcon className="material-icons">alarm</FontIcon>
const deploymentIcon = <FontIcon className="material-icons">device_hub</FontIcon>
const evaluationIcon = <FontIcon className="material-icons">share</FontIcon>
const taskGroupIcon = <FontIcon className="material-icons">layers</FontIcon>
const rawIcon = <FontIcon className="material-icons">code</FontIcon>

class _JobTopbar extends PureComponent {
  handleActive(tab) {
    let path = ["", "nomad", this.props.router.params.region, "jobs", this.props.job.ID, tab]
    let query = {}

    if (this.props.location.query && this.props.location.query.version) {
      query["version"] = this.props.location.query.version
    }

    this.props.router.push({
      pathname: path.map(encodeURIComponent).join("/"),
      query: query
    })
  }

  getActiveTab() {
    const location = this.props.location
    const end = location.pathname.split("/").pop()

    if (end.startsWith("info")) {
      return 0
    }

    if (end.startsWith("groups")) {
      return 1
    }

    if (end.startsWith("deployments")) {
      return 2
    }

    if (end.startsWith("allocations")) {
      return 3
    }

    if (end.startsWith("evaluations")) {
      return 4
    }

    // only for periodic jobs
    if (end.startsWith("children")) {
      return 2
    }

    if (end.startsWith("raw")) {
      if (this.props.job.Periodic || this.props.job.ParameterizedJob) {
        return 3
      }

      return 5
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
    let options = []
    options.push(
      <BottomNavigationItem key="info" label="Info" icon={infoIcon} onClick={() => this.handleActive("info")} />
    )

    options.push(
      <BottomNavigationItem
        key="groups"
        label="Groups"
        icon={taskGroupIcon}
        onClick={() => this.handleActive("groups")}
      />
    )

    if (this.props.job.Periodic || this.props.job.ParameterizedJob) {
      options.push(
        <BottomNavigationItem
          key="children"
          label="Children"
          icon={executionIcon}
          onClick={() => this.handleActive("children")}
        />
      )
    }

    if (!("version" in this.props.location.query) && !this.props.job.Periodic && !this.props.job.ParameterizedJob) {
      options.push(
        <BottomNavigationItem
          key="deployments"
          label="Deployments"
          icon={deploymentIcon}
          onClick={() => this.handleActive("deployments")}
        />
      )

      if (!this.props.job.Periodic && !this.props.job.ParameterizedJob) {
        options.push(
          <BottomNavigationItem
            key="allocations"
            label="Allocations"
            icon={allocationIcon}
            onClick={() => this.handleActive("allocations")}
          />
        )

        options.push(
          <BottomNavigationItem
            key="evaluations"
            label="Evaluations"
            icon={evaluationIcon}
            onClick={() => this.handleActive("evaluations")}
          />
        )
      }
    }

    options.push(
      <BottomNavigationItem key="raw" label="Raw" icon={rawIcon} onClick={() => this.handleActive("raw")} />
    )

    return (
      <BottomNavigation selectedIndex={this.getActiveTab()} style={this.getStyle()}>
        {options}
      </BottomNavigation>
    )
  }
}

_JobTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  job: PropTypes.object.isRequired
}

const ViewJobTopbar = withRouter(_JobTopbar)

export default ViewJobTopbar
