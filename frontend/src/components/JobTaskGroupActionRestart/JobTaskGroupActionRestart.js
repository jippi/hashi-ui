import React from "react"
import PropTypes from "prop-types"
import FontIcon from "material-ui/FontIcon"
import { connect } from "react-redux"
const orange500 = orange['500'];
import { NOMAD_CHANGE_TASK_GROUP_COUNT } from "../../sagas/event"
import Tooltip from "@material-ui/core/Tooltip"
import { orange } from '@material-ui/core/colors';

const restart = ({ job, taskGroup, dispatch }) => {
  dispatch({
    type: NOMAD_CHANGE_TASK_GROUP_COUNT,
    payload: {
      job: job.ID,
      taskGroup: taskGroup.Name,
      scaleAction: "restart"
    }
  })
}

const JobTaskGroupActionRestart = ({ job, taskGroup, dispatch }) => {
  return (
    <Tooltip title={"Set count to 0 and restore it to" + taskGroup.Count}>
      <FontIcon
        color={orange500}
        onClick={() => restart({ job, taskGroup, dispatch })}
        className="material-icons"
        style={{ cursor: "pointer" }}
      >
        refresh
      </FontIcon>
    </Tooltip>
  )
}

JobTaskGroupActionRestart.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect()(JobTaskGroupActionRestart)
