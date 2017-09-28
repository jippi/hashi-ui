import React from "react"
import PropTypes from "prop-types"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import { connect } from "react-redux"
import { NOMAD_RESTART_JOB, NOMAD_JOB_HIDE_DIALOG } from "../../sagas/event"
import { red400 } from "material-ui/styles/colors"

class JobActionRestart extends React.Component {
  handleSubmit = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
    this.props.dispatch({ type: NOMAD_RESTART_JOB, payload: this.props.job.ID })
  }

  handleCancel = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary onTouchTap={this.handleCancel} />,
      <FlatButton label="Restart job" backgroundColor={red400} onTouchTap={this.handleSubmit} />
    ]

    return (
      <Dialog title={`Restart job: ${this.props.job.ID}`} actions={actions} modal open={this.props.jobDialog === "restart"}>
        Are you sure you want to restart the job {this.props.job.ID} ?
      </Dialog>
    )
  }
}

function mapStateToProps({ job, jobDialog }) {
  return { job, jobDialog }
}

JobActionRestart.propTypes = {
  dispatch: PropTypes.func.isRequired,
  job: PropTypes.object.isRequired,
  jobDialog: PropTypes.string
}

export default connect(mapStateToProps)(JobActionRestart)
