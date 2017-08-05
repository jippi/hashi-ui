import React from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { connect } from "react-redux"
import { red500 } from "material-ui/styles/colors"
import { NOMAD_CHANGE_TASK_GROUP_COUNT } from "../../sagas/event"

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
    <FontIcon
      title="Stop the task group (setting count to 0)"
      color={red500}
      onClick={() => stop({ job, taskGroup, dispatch })}
      className="material-icons"
      style={{ cursor: "pointer" }}
    >
      stop
    </FontIcon>
  )
}

JobTaskGroupActionStop.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobTaskGroupActionStop)
