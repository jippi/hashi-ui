import React from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { connect } from "react-redux"
const green500 = green['500'];
const orange500 = orange['500'];
import { NOMAD_CHANGE_TASK_GROUP_COUNT } from "../../sagas/event"
import Tooltip from "@material-ui/core/Tooltip"
import { green, orange } from '@material-ui/core/colors';

const scaleUp = ({ job, taskGroup, dispatch }) => {
  dispatch({
    type: NOMAD_CHANGE_TASK_GROUP_COUNT,
    payload: {
      job: job.ID,
      taskGroup: taskGroup.Name,
      scaleAction: "increase"
    }
  })
}

const scaleDown = ({ job, taskGroup, dispatch }) => {
  dispatch({
    type: NOMAD_CHANGE_TASK_GROUP_COUNT,
    payload: {
      job: job.ID,
      taskGroup: taskGroup.Name,
      scaleAction: "decrease"
    }
  })
}

const JobTaskGroupActionScale = ({ job, taskGroup, dispatch }) => {
  return (
    <span>
      <Tooltip title="Increase task group count by 1">
        <FontIcon
          color={green500}
          onClick={() => scaleUp({ job, taskGroup, dispatch })}
          className="material-icons"
          style={{ cursor: "pointer" }}
        >
          arrow_upward
        </FontIcon>
      </Tooltip>

      <Tooltip title="Decrease task group count by 1">
        <FontIcon
          color={orange500}
          onClick={() => scaleDown({ job, taskGroup, dispatch })}
          className="material-icons"
          style={{ cursor: "pointer" }}
        >
          arrow_downward
        </FontIcon>
      </Tooltip>
    </span>
  )
}

JobTaskGroupActionScale.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobTaskGroupActionScale)
