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
              action: "enable"
            }
          })
          break

        case "drain_off":
          this.props.dispatch({
            type: NOMAD_DRAIN_CLIENT,
            payload: {
              id: this.props.node.ID,
              action: "disable"
            }
          })

          break

        case "remove":
          this.props.dispatch({
            type: NOMAD_REMOVE_CLIENT,
            payload: this.props.node.Name
          })
          break
      }
    }
  }

  getDrainMenu() {
    if (this.props.node.Drain) {
      return (
        <MenuItem
          primaryText="Disable Drain mode"
          rightIcon={
            <FontIcon className="material-icons" color={green500}>
              check_box
            </FontIcon>
          }
          onTouchTap={this.handleClick("drain_off")}
        />
      )
    }

    return (
      <MenuItem
        primaryText="Enable Drain mode"
        rightIcon={
          <FontIcon className="material-icons" color={red500}>
            check_box
          </FontIcon>
        }
        onTouchTap={this.handleClick("drain_on")}
      />
    )
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
        onTouchTap={this.handleClick("remove")}
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

    return (
      <span>
        <IconMenu
          iconButtonElement={icon}
          style={{ background: green500, borderRadius: "50%" }}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          targetOrigin={{ horizontal: "left", vertical: "top" }}
        >
          {this.getDrainMenu()}
          {this.getForceRemoveMenu()}
        </IconMenu>
      </span>
    )
  }
}

ClientActionMenu.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect()(ClientActionMenu)
