import React from "react"
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
  dispatch: React.PropTypes.func.isRequired,
  job: React.PropTypes.object.isRequired,
  jobDialog: React.PropTypes.string,
}

export default connect(mapStateToProps)(JobActionEvaluate)
