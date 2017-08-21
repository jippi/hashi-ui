import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import JobTopbar from "../components/JobTopbar/JobTopbar"
import JobActionMenu from "../components/JobActionMenu/JobActionMenu"
import DropDownMenu from "material-ui/DropDownMenu"
import MenuItem from "material-ui/MenuItem"
import {
  NOMAD_WATCH_JOB,
  NOMAD_UNWATCH_JOB,
  NOMAD_WATCH_JOB_VERSIONS,
  NOMAD_UNWATCH_JOB_VERSIONS
} from "../sagas/event"
import { Link, withRouter } from "react-router"

class Job extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: NOMAD_WATCH_JOB_VERSIONS,
      payload: this.props.params.jobId
    })

    this.props.dispatch({
      type: NOMAD_WATCH_JOB,
      payload: {
        id: this.props.params.jobId,
        version: this.props.location.query.version
      }
    })
  }

  componentWillUpdate(nextProps, nextState) {
    const curQuery = this.props.location.query || {}
    const newQuery = nextProps.location.query || {}

    if (curQuery["version"] != newQuery["version"]) {
      let version = newQuery.version || undefined

      this.props.dispatch({
        type: NOMAD_UNWATCH_JOB,
        payload: {
          id: this.props.params.jobId,
          version: curQuery.version
        }
      })

      this.props.dispatch({
        type: NOMAD_WATCH_JOB,
        payload: {
          id: this.props.params.jobId,
          version: version
        }
      })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_JOB,
      payload: {
        id: this.props.params.jobId,
        version: this.props.location.query.version
      }
    })

    this.props.dispatch({
      type: NOMAD_UNWATCH_JOB_VERSIONS,
      payload: this.props.params.jobId
    })
  }

  breadcrumb() {
    const query = this.props.location.query || {}
    let out = []

    out.push(
      <span key="job-name">
        {this.props.job.Name}
      </span>
    )

    if (this.props.job.Version) {
      const handleChange = (event, index, value) => {
        let query = { version: value }

        if (value == this.props.jobVersions[0]) {
          query = undefined
        }

        this.props.router.push({
          pathname: this.props.location.pathname,
          query: query
        })
      }

      const style = {
        height: "25px",
        fontSize: "inherit"
      }

      const labelStyle = {
        height: "20px",
        lineHeight: "inherit"
      }

      const iconStyle = {
        top: "-12px",
        right: "10px"
      }

      let versions = []
      this.props.jobVersions.forEach(element => {
        versions.push(<MenuItem key={element} value={element} primaryText={`v${element}`} />)
      }, this)

      out.push(
        <DropDownMenu
          style={style}
          labelStyle={labelStyle}
          iconStyle={iconStyle}
          key="job-version"
          value={this.props.job.Version}
          onChange={handleChange}
        >
          {versions}
        </DropDownMenu>
      )
    }

    if (query.taskGroupId) {
      out.push("> ")
      out.push(query.taskGroupId.split(".")[1])
    }

    if (query.taskId) {
      out.push(" > ")
      out.push(query.taskId.split(".")[2])
    }

    return out
  }

  render() {
    if (this.props.job.ID == null) {
      return <div>Loading ...</div>
    }

    return (
      <div>
        <div style={{ float: "left", paddingTop: 11 }}>
          <h2>
            Job: {this.breadcrumb()}
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

function mapStateToProps({ job, jobVersions }) {
  return { job, jobVersions }
}

Job.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  job: PropTypes.object.isRequired,
  jobVersions: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(withRouter(Job))
