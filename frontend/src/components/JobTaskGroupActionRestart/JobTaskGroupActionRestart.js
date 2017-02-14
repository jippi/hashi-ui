import React, { PropTypes } from 'react'
import FontIcon from 'material-ui/FontIcon'
import { connect } from 'react-redux'
import { orange500 } from 'material-ui/styles/colors'
import { CHANGE_TASK_GROUP_COUNT } from '../../sagas/event'

const restart = ({ job, taskGroup, dispatch }) => {
  dispatch({
    type: CHANGE_TASK_GROUP_COUNT,
    payload: {
      job: job.ID,
      taskGroup: taskGroup.Name,
      scaleAction: 'restart'
    }
  })
}

const JobTaskGroupActionRestart = ({ job, taskGroup, dispatch }) => {
  return (
    <FontIcon
      title={ "Set count to 0 and restore it to" + taskGroup.Count }
      color={ orange500 }
      onClick={ () => restart({ job, taskGroup, dispatch }) }
      className='material-icons'
      style={{ cursor: 'pointer' }}
    >
      refresh
    </FontIcon>
  )
};

JobTaskGroupActionRestart.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(JobTaskGroupActionRestart)
