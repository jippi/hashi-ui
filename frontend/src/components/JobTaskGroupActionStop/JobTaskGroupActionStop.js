import React from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { connect } from "react-redux"
import Tooltip from "@material-ui/core/Tooltip"
const red500 = red['500'];
import { NOMAD_CHANGE_TASK_GROUP_COUNT } from "../../sagas/event"
import { red } from '@material-ui/core/colors';

const stop = ({ job, taskGroup, dispatch }) => {
  dispatch({
    type: NOMAD_CHANGE_TASK_GROUP_COUNT,
    payload: {
      job: job.ID,
      taskGroup: taskGroup.Name,
      scaleAction: "stop"
    }
  })
}

const JobTaskGroupActionStop = ({ job, taskGroup, dispatch }) => {
  return (
    <Tooltip title="Stop the task group (setting count to 0)">
      <FontIcon
        color={red500}
        onClick={() => stop({ job, taskGroup, dispatch })}
        className="material-icons"
        style={{ cursor: "pointer" }}
      >
        stop
      </FontIcon>
    </Tooltip>
  )
}

JobTaskGroupActionStop.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobTaskGroupActionStop)
