import React from "react"
import PropTypes from "prop-types"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import { connect } from "react-redux"
import { NOMAD_STOP_JOB, NOMAD_JOB_HIDE_DIALOG } from "../../sagas/event"
import { red } from '@material-ui/core/colors';
const red400 = red['400'];

class JobActionStop extends React.Component {
  handleSubmit = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
    this.props.dispatch({ type: NOMAD_STOP_JOB, payload: this.props.job.ID })
  }

  handleCancel = () => {
    this.props.dispatch({ type: NOMAD_JOB_HIDE_DIALOG })
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary onClick={this.handleCancel} />,
      <FlatButton label="Stop job" backgroundColor={red400} onClick={this.handleSubmit} />
    ]

    return (
      <Dialog title={`Stop job: ${this.props.job.ID}`} actions={actions} modal open={this.props.jobDialog === "stop"}>
        Are you sure you want to stop the job {this.props.job.ID} ?
      </Dialog>
    )
  }
}

function mapStateToProps({ job, jobDialog }) {
  return { job, jobDialog }
}

JobActionStop.propTypes = {
  dispatch: PropTypes.func.isRequired,
  job: PropTypes.object.isRequired,
  jobDialog: PropTypes.string
}

export default connect(mapStateToProps)(JobActionStop)
