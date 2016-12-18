import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux'
import { STOP_JOB, JOB_HIDE_DIALOG } from '../../sagas/event'
import { red400 } from 'material-ui/styles/colors'

class JobActionStop extends React.Component {

  handleSubmit = () => {
    this.props.dispatch({ type: JOB_HIDE_DIALOG })
    this.props.dispatch({ type: STOP_JOB, payload: this.props.job.ID })
  };

  handleCancel = () => {
    this.props.dispatch({ type: JOB_HIDE_DIALOG })
  }

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={ this.handleCancel }
      />,
      <FlatButton
        label='Stop job'
        backgroundColor={ red400 }
        onTouchTap={ this.handleSubmit }
      />,
    ];

    return (
      <Dialog
        title={ `Stop job: ${this.props.job.ID}` }
        actions={ actions }
        modal
        open={ this.props.jobDialog === 'stop' }
      >
        Are you sure you want to stop the job { this.props.job.ID } ?
      </Dialog>
    );
  }
}

function mapStateToProps ({ job, jobDialog }) {
  return { job, jobDialog }
}

JobActionStop.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  job: React.PropTypes.object.isRequired,
  jobDialog: React.PropTypes.string,
}

export default connect(mapStateToProps)(JobActionStop)
