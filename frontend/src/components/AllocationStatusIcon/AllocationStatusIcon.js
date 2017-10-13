import React, { Component } from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { amber500, green500, red500, orange500 } from "material-ui/styles/colors"

//
// map of ClientStatus and nested below the DesiredStatus
//

const clientStatusColor = {
  pending: {
    run: (
      <FontIcon title="Pending -> run" color={amber500} className="material-icons">
        schedule
      </FontIcon>
    ),
    default: (
      <FontIcon title="Pending" className="material-icons">
        schedule
      </FontIcon>
    )
  },
  running: {
    stop: (
      <FontIcon title="Running but been told to stop" color={amber500} className="material-icons">
        stop
      </FontIcon>
    ),
    run: (
      <FontIcon title="Running" color={green500} className="material-icons">
        play_arrow
      </FontIcon>
    ),
    default: (
      <FontIcon title="Running but is transitioning to another state" className="material-icons">
        play_arrow
      </FontIcon>
    )
  },
  failed: {
    default: (
      <FontIcon title="Failed and not replaced" color={red500} className="material-icons">
        error
      </FontIcon>
    ),
    replaced: (
      <FontIcon title="Failed and was replaced with a healthy allocation" color={orange500} className="material-icons">
        error
      </FontIcon>
    )
  },
  lost: {
    default: (
      <FontIcon title="Lost and not replaced" color={red500} className="material-icons">
        cached
      </FontIcon>
    ),
    replaced: (
      <FontIcon title="Lost and was replaced with a healhy allocation" color={orange500} className="material-icons">
        cached
      </FontIcon>
    )
  },
  complete: {
    stop: (
      <FontIcon color={green500} className="material-icons">
        check
      </FontIcon>
    ),
    default: <FontIcon className="material-icons">stop</FontIcon>
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
      for (let i = 0; i <= this.props.rowIndex; i++) {
        // the allocation name must be the same
        if (this.props.allocations[i].Name != this.props.allocation.Name) {
          continue
        }

        // the replacement allocation must be healthy
        if (["failed", "lost"].indexOf(this.props.allocations[i].ClientStatus) == -1) {
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
