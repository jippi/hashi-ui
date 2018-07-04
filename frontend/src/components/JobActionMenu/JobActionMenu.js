import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import RaisedButton from "material-ui/RaisedButton"
import IconMenu from "material-ui/IconMenu"
import IconButton from "material-ui/IconButton"
import FontIcon from "material-ui/FontIcon"
import MenuItem from "material-ui/MenuItem"
import { green500 } from "material-ui/styles/colors"
import JobEditRawJSON from "../JobEditRawJSON/JobEditRawJSON"
import JobActionStop from "../JobActionStop/JobActionStop"
import JobActionStopStart from "../JobActionStopStart/JobActionStopStart"
import JobActionRollingRestart from "../JobActionRollingRestart/JobActionRollingRestart"
import JobActionEvaluate from "../JobActionEvaluate/JobActionEvaluate"
import { NOMAD_JOB_SHOW_DIALOG } from "../../sagas/event"
class JobActionMenu extends PureComponent {
  handleClick = key => {
    return () => {
      this.props.dispatch({ type: NOMAD_JOB_SHOW_DIALOG, payload: key })
    }
  }

  menu() {
    let showMenu = true
    let showLabel = false

    if (window.innerWidth > 1400) {
      showMenu = false
      showLabel = true
    } else if (window.innerWidth > 1200) {
      showMenu = false
      showLabel = false
    }

    if (!showMenu) {
      const style = { marginLeft: 12, marginTop: 5, marginBottom: 5 }

      return [<RaisedButton key="edit" onClick={this.handleClick("edit")} label={showLabel ? "Edit" : undefined} title="Edit job" icon={<FontIcon className="material-icons">
              edit
            </FontIcon>} />, <RaisedButton key="evaluate" onClick={this.handleClick("evaluate")} label={showLabel ? "Evaluate" : undefined} title="Evaluate job" icon={<FontIcon className="material-icons">
              refresh
            </FontIcon>} style={style} />, <RaisedButton key="evaluate-reschedule" onClick={this.handleClick("evaluate-reschedule")} label={showLabel ? "Evaluate (Reschedule)" : undefined} title="Evaluate job (Reschedule)" icon={<FontIcon className="material-icons">
              refresh
            </FontIcon>} style={style} />, <RaisedButton key="stop" onClick={this.handleClick("stop")} label={showLabel ? "Stop" : undefined} title="Stop job" icon={<FontIcon className="material-icons">
              stop
            </FontIcon>} style={style} />, <IconMenu key="restart_menu" iconButtonElement={<RaisedButton key="restart" label={showLabel ? "Restart" : undefined} title="Restart job" icon={<FontIcon className="material-icons">
                  loop
                </FontIcon>} style={style} />}>
          <MenuItem primaryText="Stop / start" onClick={this.handleClick("stop_start")} />
          <MenuItem primaryText="Rolling restart" onClick={this.handleClick("rolling_restart")} />
        </IconMenu>]
    }

    const icon = (
      <IconButton>
        <FontIcon className="material-icons" color="white">
          more_vert
        </FontIcon>
      </IconButton>
    )

    return <IconMenu iconButtonElement={icon} style={{ background: green500, borderRadius: "50%" }} anchorOrigin={{ horizontal: "left", vertical: "top" }} targetOrigin={{ horizontal: "left", vertical: "top" }}>
        <MenuItem primary primaryText="Edit job" rightIcon={<FontIcon className="material-icons">
              edit
            </FontIcon>} onClick={this.handleClick("edit")} />
        <MenuItem primaryText="Evaluate job" rightIcon={<FontIcon className="material-icons">
              refresh
            </FontIcon>} onClick={this.handleClick("evaluate")} />
        <MenuItem primaryText="Evaluate job (Reschedule)" rightIcon={<FontIcon className="material-icons">
              refresh
            </FontIcon>} onClick={this.handleClick("evaluate-reschedule")} />
        <MenuItem primaryText="Stop job" rightIcon={<FontIcon className="material-icons">
              stop
            </FontIcon>} onClick={this.handleClick("stop")} />
        <MenuItem primaryText="Restart job" rightIcon={<FontIcon className="material-icons">
              loop
            </FontIcon>} menuItems={[<MenuItem primaryText="Stop / start" onClick={this.handleClick("stop_start")} />, <MenuItem primaryText="Rolling restart" onClick={this.handleClick("rolling_restart")} />]} />
      </IconMenu>
  }

  render() {
    if (this.props.location.query["version"]) {
      return null
    }

    return (
      <span>
        <JobEditRawJSON />
        <JobActionStop />
        <JobActionEvaluate />
        <JobActionStopStart />
        <JobActionRollingRestart />

        {this.menu()}
      </span>
    )
  }
}

JobActionMenu.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobActionMenu)
