import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import JobTopbar from "../components/JobTopbar/JobTopbar"
import JobActionMenu from "../components/JobActionMenu/JobActionMenu"
import { WATCH_JOB, UNWATCH_JOB } from "../sagas/event"

class Job extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: WATCH_JOB,
      payload: this.props.params.jobId
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: UNWATCH_JOB,
      payload: this.props.params.jobId
    })
  }

  breadcrumb() {
    const query = this.props.location.query || {}
    let out = []

    if (query.taskGroupId) {
      out = query.taskGroupId.split(".")
    }

    if (query.taskId) {
      out = query.taskId.split(".")
    }

    if (out.length === 0) {
      return this.props.job.Name
    }

    return out.join(" > ")
  }

  render() {
    if (this.props.job == null) {
      return null
    }

    return (
      <div>
        <div style={{ float: "left", paddingTop: 11 }}>
          <h2>
            Job: {this.breadcrumb()}{" "}
          </h2>
        </div>

        <div style={{ float: "right", width: 50 }}>
          <JobActionMenu {...this.props} />
        </div>

        <JobTopbar {...this.props} />

        <div style={{ clear: "both", paddingTop: "1rem" }} />

        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps({ job }) {
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
