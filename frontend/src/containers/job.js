import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import JobTopbar from '../components/JobTopbar/JobTopbar'
import JobEditRawJSON from '../components/JobEditRawJSON/JobEditRawJSON'
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

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <div style={{ float: 'left' }}>
            <h2>Job: { this.props.job.Name }</h2>
          </div>

          <div style={{ float: 'right' }}>
            <JobEditRawJSON { ...this.props } />
          </div>

          <br />
          <br />

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
