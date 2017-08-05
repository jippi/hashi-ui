import React from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { connect } from "react-redux"
import { green500, orange500 } from "material-ui/styles/colors"
import { NOMAD_CHANGE_TASK_GROUP_COUNT } from "../../sagas/event"

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
      <FontIcon
        title="Increase task group count by 1"
        color={green500}
        onClick={() => scaleUp({ job, taskGroup, dispatch })}
        className="material-icons"
        style={{ cursor: "pointer" }}
      >
        arrow_upward
      </FontIcon>

      <FontIcon
        color={orange500}
        title="Decrease task group count by 1"
        onClick={() => scaleDown({ job, taskGroup, dispatch })}
        className="material-icons"
        style={{ cursor: "pointer" }}
      >
        arrow_downward
      </FontIcon>
    </span>
  )
}

JobTaskGroupActionScale.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobTaskGroupActionScale)
