import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { NOMAD_EVALUATE_JOB, NOMAD_JOB_HIDE_DIALOG } from "../../sagas/event"

class JobActionEvaluate extends React.Component {
  handleSubmit = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
    this.props.dispatch({ type: NOMAD_EVALUATE_JOB, payload: this.props.job.ID })
  }

  componentWillUpdate(nextProps) {
    if (nextProps.jobDialog === "evaluate") {
      this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
      this.props.dispatch({ type: NOMAD_EVALUATE_JOB, payload: { job: this.props.job.ID } })
    }

    if (nextProps.jobDialog === "evaluate-reschedule") {
      this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
      this.props.dispatch({ type: NOMAD_EVALUATE_JOB, payload: { job: this.props.job.ID, reschedule: true } })
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

JobActionEvaluate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  job: PropTypes.object.isRequired,
  jobDialog: PropTypes.string
}

export default connect(mapStateToProps)(JobActionEvaluate)
