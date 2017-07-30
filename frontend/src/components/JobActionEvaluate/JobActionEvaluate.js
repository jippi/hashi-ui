import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { EVALUATE_JOB, JOB_HIDE_DIALOG } from "../../sagas/event"

class JobActionEvaluate extends React.Component {
  handleSubmit = () => {
    this.props.dispatch({ type: JOB_HIDE_DIALOG })
    this.props.dispatch({ type: EVALUATE_JOB, payload: this.props.job.ID })
  }

  componentWillUpdate(nextProps) {
    if (nextProps.jobDialog === "evaluate") {
      this.props.dispatch({ type: JOB_HIDE_DIALOG })
      this.props.dispatch({ type: EVALUATE_JOB, payload: this.props.job.ID })
    }
  }

  handleCancel = () => {
    this.props.dispatch({ type: JOB_HIDE_DIALOG })
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
