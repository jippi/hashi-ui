import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import IconMenu from "material-ui/IconMenu"
import IconButton from "material-ui/IconButton"
import FontIcon from "material-ui/FontIcon"
import MenuItem from "material-ui/MenuItem"
import { red500, green500 } from "material-ui/styles/colors"
import { NOMAD_DRAIN_CLIENT, NOMAD_REMOVE_CLIENT } from "../../sagas/event"

class ClientActionMenu extends Component {
  handleClick = key => {
    return () => {
      switch (key) {
        case "drain_on":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action_type: "set_drain",
              drain: "on",
            }
          })
          break

        case "drain_on_ignore_system_jobs":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action_type: "set_drain",
              ignore_system_jobs: "on",
              eligible: "on",
              drain: "on",
            }
          })
          break

        case "drain_off":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action_type: "set_drain",
            }
          })
          break

        case "eligibility_off":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action_type: "set_eligibility",
              eligible: "off"
            }
          })
          break

        case "eligibility_on":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action_type: "set_eligibility",
              eligible: "on"
            }
          })
          break

        case "remove":
          this.props.dispatch({ type: NOMAD_REMOVE_CLIENT, payload: this.props.node.Name })
          break
      }
    }
  }

  getDrainMenu() {
    if (this.props.node.Drain) {
      return (
        <MenuItem
          primaryText="Stop Draining node"
          rightIcon={
            <FontIcon className="material-icons" color={green500}>
              check_box
            </FontIcon>
          }
          onClick={this.handleClick("drain_off")}
        />
      )
    }

    return [
      <MenuItem
        primaryText="Start Draining node"
        rightIcon={
          <FontIcon className="material-icons" color={red500}>
            check_box
          </FontIcon>
        }
        onClick={this.handleClick("drain_on")}
      />,
      <MenuItem
        primaryText="Start Draining (ignore system)"
        rightIcon={
          <FontIcon className="material-icons" color={red500}>
            check_box
          </FontIcon>
        }
        onClick={this.handleClick("drain_on_ignore_system_jobs")}
      />
    ]
  }

  getSchedulingEligibilityMenu() {
    if (this.props.node.SchedulingEligibility == "eligible") {
      return <MenuItem primaryText="Disable node for scheduling" rightIcon={<FontIcon className="material-icons" color={green500}>
              check_box
            </FontIcon>} onClick={this.handleClick("eligibility_off")} />
    }

    return <MenuItem primaryText="Enable node for scheduling" rightIcon={<FontIcon className="material-icons" color={red500}>
            check_box
          </FontIcon>} onClick={this.handleClick("eligibility_on")} />
  }

  getForceRemoveMenu() {
    if (this.props.node.Status != "failed") {
      return null
    }

    return (
      <MenuItem
        primaryText="Remove client"
        rightIcon={
          <FontIcon className="material-icons" color={red500}>
            remove_circle
          </FontIcon>
        }
        onClick={this.handleClick("remove")}
      />
    )
  }

  render() {
    const icon = (
      <IconButton>
        <FontIcon className="material-icons" color="white">
          more_vert
        </FontIcon>
      </IconButton>
    )

    return <span>
        <IconMenu iconButtonElement={icon} style={{ background: green500, borderRadius: "50%" }} anchorOrigin={{ horizontal: "left", vertical: "top" }} targetOrigin={{ horizontal: "left", vertical: "top" }}>
          {this.getDrainMenu()}
          {this.getSchedulingEligibilityMenu()}
          {this.getForceRemoveMenu()}
        </IconMenu>
      </span>
  }
}

ClientActionMenu.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect()(ClientActionMenu)
