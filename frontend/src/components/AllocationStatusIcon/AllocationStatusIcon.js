import React, { PureComponent, PropTypes } from "react"
import ReactTooltip from "react-tooltip"
import AppendedReactTooltip from "../AppendedReactTooltip/AppendedReactTooltip"
import FontIcon from "material-ui/FontIcon"
import { amber500, green500, red500 } from "material-ui/styles/colors"

//
// map of ClientStatus and nested below the DesiredStatus
//

const clientStatusColor = {
  pending: {
    run: <FontIcon color={amber500} className="material-icons">schedule</FontIcon>,
    default: <FontIcon className="material-icons">schedule</FontIcon>
  },
  running: {
    stop: <FontIcon color={amber500} className="material-icons">stop</FontIcon>,
    run: (
      <FontIcon color={green500} className="material-icons">
        play_arrow
      </FontIcon>
    ),
    default: <FontIcon className="material-icons">play_arrow</FontIcon>
  },
  failed: {
    default: <FontIcon color={red500} className="material-icons">error</FontIcon>
  },
  lost: {
    default: <FontIcon color={red500} className="material-icons">cached</FontIcon>
  },
  complete: {
    stop: <FontIcon color={green500} className="material-icons">check</FontIcon>,
    default: <FontIcon className="material-icons">stop</FontIcon>
  }
}

class AllocationStatusIcon extends PureComponent {
  render() {
    const allocation = this.props.allocation
    const statusConfig = clientStatusColor[allocation.ClientStatus]
    let icon = null

    if (allocation.DesiredStatus in statusConfig) {
      icon = statusConfig[allocation.DesiredStatus]
    } else {
      icon = statusConfig.default
    }

    let tt = allocation.ClientStatus + " -> " + allocation.DesiredStatus

    return <div ref="valueDiv" data-tip={tt}>{icon}</div>
  }
}

AllocationStatusIcon.defaultProps = {}

AllocationStatusIcon.propTypes = {
  allocation: PropTypes.object.isRequired
}

export default AllocationStatusIcon
