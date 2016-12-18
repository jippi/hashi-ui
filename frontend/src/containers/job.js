import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import JobTopbar from '../components/JobTopbar/JobTopbar'
import JobActionMenu from '../components/JobActionMenu/JobActionMenu'
import { WATCH_JOB, UNWATCH_JOB } from '../sagas/event'

class Job extends Component {

  componentWillMount () {
    this.props.dispatch({ type: WATCH_JOB, payload: this.props.params.jobId })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: UNWATCH_JOB, payload: this.props.params.jobId })
  }

  render () {
    if (this.props.job == null) {
      return null
    }

    return (
      <div>
        <JobTopbar { ...this.props } />

        <div style={{ padding: 10, paddingBottom: 0, paddingTop: 0 }}>
          <div style={{ float: 'left', paddingTop: 11 }}>
            <h2>Job: { this.props.job.Name }</h2>
          </div>

          <div style={{ float: 'right', width: 50 }}>
            <JobActionMenu { ...this.props } />
          </div>

          <div style={{ clear: 'both', paddingTop: '1rem' }} />

          { this.props.children }
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ job }) {
  return { job }
}

Job.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  job: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Job)
