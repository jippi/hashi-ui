import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { green500, red500, orange500 } from "material-ui/styles/colors"
import { NOMAD_CHANGE_DEPLOYMENT_STATUS } from "../../sagas/event"

class DeploymentAction extends Component {
  sendUpdate(action) {
    this.props.dispatch({
      type: NOMAD_CHANGE_DEPLOYMENT_STATUS,
      payload: {
        id: this.props.id,
        action: action,
        group: this.props.group
      }
    })
  }

  icon() {
    switch (this.props.action) {
      case "promote":
        return ["thumb_up", green500, "promote", "promote"]
      case "fail":
        return ["thumb_down", red500, "fail", "fail"]
      case "pause":
        if (this.props.status != "paused") {
          return ["pause", orange500, "pause", "pause"]
        } else {
          return ["play_arrow", orange500, "resume", "resume"]
        }
    }
  }

  render() {
    if (["successful", "cancelled", "failed"].indexOf(this.props.status) != -1) {
      return null
    }

    const iconConfig = this.icon()

    if (!this.props.showText) {
      iconConfig[2] = null
    }

    return (
      <span>
        <FontIcon
          className="material-icons"
          color={iconConfig[1]}
          style={{ cursor: "pointer" }}
          onClick={() => this.sendUpdate(iconConfig[3])}
        >
          {iconConfig[0]}
        </FontIcon>
        <span style={{ verticalAlign: "top", paddingLeft: "5px" }}>{iconConfig[2]}</span>
      </span>
    )
  }
}

DeploymentAction.defaultProps = {
  showText: true
}

DeploymentAction.propTypes = {
  id: PropTypes.string.isRequired,
  showText: PropTypes.bool,
  action: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  group: PropTypes.string
}

export default connect()(DeploymentAction)
