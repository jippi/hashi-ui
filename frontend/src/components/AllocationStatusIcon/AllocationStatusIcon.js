import React, { Component } from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { amber, green, red, orange } from '@material-ui/core/colors';
import Tooltip from "@material-ui/core/Tooltip"
const amber500 = amber['500'];
const green500 = green['500'];
const red500 = red['500'];
const orange500 = orange['500'];

//
// map of ClientStatus and nested below the DesiredStatus
//

const clientStatusColor = {
  pending: {
    run: (
      <Tooltip title="Pending -> run">
        <FontIcon color={amber500} className="material-icons">
          schedule
        </FontIcon>
      </Tooltip>
    ),
    default: (
      <Tooltip title="Pending">
        <FontIcon className="material-icons">schedule</FontIcon>
      </Tooltip>
    )
  },
  running: {
    stop: (
      <Tooltip title="Running but been told to stop">
        <FontIcon color={amber500} className="material-icons">
          stop
        </FontIcon>
      </Tooltip>
    ),
    run: (
      <Tooltip title="Running">
        <FontIcon color={green500} className="material-icons">
          play_arrow
        </FontIcon>
      </Tooltip>
    ),
    default: (
      <Tooltip title="Running but is transitioning to another state">
        <FontIcon className="material-icons">play_arrow</FontIcon>
      </Tooltip>
    )
  },
  failed: {
    default: (
      <Tooltip title="Failed and not replaced">
        <FontIcon color={red500} className="material-icons">
          error
        </FontIcon>
      </Tooltip>
    ),
    replaced: (
      <Tooltip title="Failed and was replaced with a healthy allocation">
        <FontIcon color={orange500} className="material-icons">
          error
        </FontIcon>
      </Tooltip>
    )
  },
  lost: {
    default: (
      <Tooltip title="Lost and not replaced">
        <FontIcon color={red500} className="material-icons">
          cached
        </FontIcon>
      </Tooltip>
    ),
    replaced: (
      <Tooltip title="Lost and was replaced with a healhy allocation">
        <FontIcon color={orange500} className="material-icons">
          cached
        </FontIcon>
      </Tooltip>
    )
  },
  complete: {
    stop: (
      <Tooltip title="Stopped">
        <FontIcon color={green500} className="material-icons">
          check
        </FontIcon>
      </Tooltip>
    ),
    default: (
      <Tooltip title="Stopped">
        <FontIcon className="material-icons">stop</FontIcon>
      </Tooltip>
    )
  }
}

class AllocationStatusIcon extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      // id must be the same
      this.props.allocation.ID != nextProps.allocation.ID ||
      // client status must be the same
      this.props.allocation.ClientStatus != nextProps.allocation.ClientStatus ||
      // desired status must be the same
      this.props.allocation.DesiredStatus != nextProps.allocation.DesiredStatus ||
      // rowIndex must be the same
      this.props.rowIndex != this.props.rowIndex
    )
  }

  render() {
    const allocation = this.props.allocation
    const statusConfig = clientStatusColor[allocation.ClientStatus]
    let icon = null

    if (allocation.DesiredStatus in statusConfig) {
      icon = statusConfig[allocation.DesiredStatus]
    } else {
      icon = statusConfig.default
    }

    // check if there is a healthy version of this failed allocation and convert the error into a warning
    if (["failed", "lost"].indexOf(allocation.ClientStatus) >= 0 && this.props.allocations.length > 1) {
      // only check allocations *before* the current allocation for healthy allocations
      for (let i = this.props.rowIndex; i >= 0; i--) {
        // the allocation name must be the same
        if (this.props.allocations[i].Name != this.props.allocation.Name) {
          continue
        }

        // the replacement allocation must be healthy
        if (this.props.allocations[i].ClientStatus != "running") {
          continue
        }

        // replace the state
        icon = statusConfig["replaced"]
      }
    }

    let tt = allocation.ClientStatus + " -> " + allocation.DesiredStatus

    return (
      <div ref="valueDiv" data-tip={tt}>
        {icon}
      </div>
    )
  }
}

AllocationStatusIcon.defaultProps = {
  allocations: [],
  rowIndex: -1
}

AllocationStatusIcon.propTypes = {
  allocation: PropTypes.object.isRequired,
  allocations: PropTypes.array,
  rowIndex: PropTypes.number
}

export default AllocationStatusIcon
