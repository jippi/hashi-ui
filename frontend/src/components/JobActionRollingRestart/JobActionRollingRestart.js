import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { NOMAD_ROLLING_RESTART_JOB, NOMAD_JOB_HIDE_DIALOG } from "../../sagas/event"

class JobActionRollingRestart extends React.Component {
  handleSubmit = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
    this.props.dispatch({ type: NOMAD_ROLLING_RESTART_JOB, payload: this.props.job.ID })
  }

  componentWillUpdate(nextProps) {
    if (nextProps.jobDialog === "rolling_restart") {
      this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
      this.props.dispatch({ type: NOMAD_ROLLING_RESTART_JOB, payload: this.props.job.ID })
    }
  }

  handleCancel = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
  }

  render() {
    return null
  }
}

function mapStateToProps({ job, jobDialog }) {
  return { job, jobDialog }
}

JobActionRollingRestart.propTypes = {
  dispatch: PropTypes.func.isRequired,
  job: PropTypes.object.isRequired,
  jobDialog: PropTypes.string
}

export default connect(mapStateToProps)(JobActionRollingRestart)
