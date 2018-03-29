import FontIcon from "material-ui/FontIcon"
import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import { withRouter } from "react-router"

const infoIcon = <FontIcon className="material-icons">info_outline</FontIcon>
const statsIcon = <FontIcon className="material-icons">show_chart</FontIcon>
const filesIcon = <FontIcon className="material-icons">storage</FontIcon>
const logsIcon = <FontIcon className="material-icons">subject</FontIcon>
const rawIcon = <FontIcon className="material-icons">code</FontIcon>

class _AllocationTopbar extends PureComponent {
  handleActive(tab) {
    const path = ["", "nomad", this.props.router.params.region, "allocations", this.props.allocation.ID, tab]
    this.props.router.push(path.map(encodeURIComponent).join("/"))
  }

  getActiveTab() {
    const location = this.props.location
    const end = location.pathname.split("/").pop()

    if (end.startsWith("info")) {
      return 0
    }

    if (end.startsWith("stats")) {
      return 1
    }

    if (end.startsWith("files")) {
      if (location.query.path && location.query.path.indexOf("alloc/logs") !== -1) {
        return 3
      }

      return 2
    }

    if (end.startsWith("raw")) {
      return 4
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
      <BottomNavigation selectedIndex={this.getActiveTab()} style={this.getStyle()}>
        <BottomNavigationItem label="Info" icon={infoIcon} onClick={() => this.handleActive("info")} />
        <BottomNavigationItem label="Stats" icon={statsIcon} onClick={() => this.handleActive("stats")} />
        <BottomNavigationItem label="Files" icon={filesIcon} onClick={() => this.handleActive("files")} />
        <BottomNavigationItem label="Logs" icon={logsIcon} onClick={() => this.handleActive("logs")} />
        <BottomNavigationItem label="Raw" icon={rawIcon} onClick={() => this.handleActive("raw")} />
      </BottomNavigation>
    )
  }
}

_AllocationTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired
}

const AllocationTopbar = withRouter(_AllocationTopbar)

export default AllocationTopbar
