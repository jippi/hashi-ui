import FontIcon from "material-ui/FontIcon"
import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import { withRouter } from "react-router"

const infoIcon = <FontIcon className="material-icons">info_outline</FontIcon>
const allocationIcon = <FontIcon className="material-icons">apps</FontIcon>
const rawIcon = <FontIcon className="material-icons">code</FontIcon>

class _EvaluationTopbar extends PureComponent {
  handleActive(tab) {
    const path = ["", "nomad", this.props.router.params.region, "evaluations", this.props.evaluation.ID, tab]
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
      <BottomNavigation selectedIndex={this.getActiveTab()} style={this.getStyle()}>
        <BottomNavigationItem label="Info" icon={infoIcon} onTouchTap={() => this.handleActive("info")} />
        <BottomNavigationItem
          label="Allocations"
          icon={allocationIcon}
          onTouchTap={() => this.handleActive("allocations")}
        />
        <BottomNavigationItem label="Raw" icon={rawIcon} onTouchTap={() => this.handleActive("raw")} />
      </BottomNavigation>
    )
  }
}

_EvaluationTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  evaluation: PropTypes.object.isRequired
}

const ViewEvaluationTopbar = withRouter(_EvaluationTopbar)

export default ViewEvaluationTopbar
