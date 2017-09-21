import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import JobTopbar from "../components/JobTopbar/JobTopbar"
import JobActionMenu from "../components/JobActionMenu/JobActionMenu"
import DropDownMenu from "material-ui/DropDownMenu"
import MenuItem from "material-ui/MenuItem"
import {
  NOMAD_WATCH_JOB,
  NOMAD_UNWATCH_JOB,
  NOMAD_WATCH_JOB_VERSIONS,
  NOMAD_UNWATCH_JOB_VERSIONS,
  NOMAD_FORCE_PERIODIC_RUN
} from "../sagas/event"
import { Link, withRouter } from "react-router"
import FloatingActionButton from "material-ui/FloatingActionButton"
import FontIcon from "material-ui/FontIcon"

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

    if (this.props.params.jobId != nextProps.params.jobId) {
      // Watch new job verions
      if (this.props.params.jobId) {
        this.props.dispatch({
          type: NOMAD_UNWATCH_JOB_VERSIONS,
          payload: this.props.params.jobId
        })

        this.props.dispatch({
          type: NOMAD_UNWATCH_JOB,
          payload: {
            id: this.props.params.jobId
          }
        })
      }

      this.props.dispatch({
        type: NOMAD_WATCH_JOB_VERSIONS,
        payload: nextProps.params.jobId
      })

      this.props.dispatch({
        type: NOMAD_WATCH_JOB,
        payload: {
          id: nextProps.params.jobId
        }
      })

      return
    }

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
      <span key="jobs">
        <Link to={{ pathname: `/nomad/${this.props.router.params.region}/jobs` }}>Jobs</Link>
      </span>
    )
    out.push(" > ")

    if (this.props.job.ParentID) {
      out.push(
        <span key="parent-job">
          <Link
            to={{
              pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(
                this.props.job.ParentID
              )}/info`
            }}
          >
            {this.props.job.ParentID}
          </Link>
        </span>
      )
      out.push(" > ")
    }

    out.push(
      <span key="job-name">
        <Link
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/info`
          }}
        >
          {this.props.job.Name.replace(this.props.job.ParentID + "/", "")}
        </Link>
      </span>
    )

    if (this.props.job.Version) {
      const handleChange = (event, index, value) => {
        let query = { version: value }

        if (value == this.props.jobVersions[0]) {
          query = undefined
        }

        this.props.router.push({
          pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/info`,
          query: query
        })
      }

      const style = {
        height: "26px",
        fontSize: "inherit"
      }

      const labelStyle = {
        height: "26px",
        lineHeight: "inherit",
        paddingRight: "15px",
        paddingLeft: 0,
        overflow: "initial"
      }

      const iconStyle = {
        top: "-12px",
        right: "-20px",
        padding: "0px"
      }

      const underlineStyle = {
        margin: "-1px"
      }

      let versions = []
      this.props.jobVersions.forEach(element => {
        let extra = ""
        if (element == this.props.jobVersions[0]) {
          extra = " (current)"
        }
        versions.push(<MenuItem key={element} value={element} primaryText={`v${element}${extra}`} />)
      }, this)

      out.push(" > ")
      out.push(
        <DropDownMenu
          style={style}
          labelStyle={labelStyle}
          iconStyle={iconStyle}
          underlineStyle={underlineStyle}
          key="job-version"
          value={this.props.job.Version}
          onChange={handleChange}
        >
          {versions}
        </DropDownMenu>
      )

      out.push("  ")
    }

    const location = this.props.location
    const end = location.pathname.split("/").pop()

    if (end.startsWith("info")) {
      out.push(" > ")
      out.push(
        <Link
          key="info"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/info`
          }}
        >
          Info
        </Link>
      )
    }

    if (end.startsWith("groups")) {
      out.push(" > ")
      out.push(
        <Link
          key="groups"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/groups`
          }}
        >
          Groups
        </Link>
      )
    }

    if (end.startsWith("deployments")) {
      out.push(" > ")
      out.push(
        <Link
          key="deployments"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(
              this.props.job.ID
            )}/deployments`
          }}
        >
          Deployments
        </Link>
      )
    }

    if (end.startsWith("allocations")) {
      out.push(" > ")
      out.push(
        <Link
          key="allocations"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(
              this.props.job.ID
            )}/allocations`
          }}
        >
          Allocations
        </Link>
      )
    }

    if (end.startsWith("children")) {
      out.push(" > ")
      out.push(
        <Link
          key="children"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/children`
          }}
        >
          Children
        </Link>
      )
    }

    if (end.startsWith("evaluations")) {
      out.push(" > ")
      out.push(
        <Link
          key="evaluations"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(
              this.props.job.ID
            )}/evaluations`
          }}
        >
          Evaluations
        </Link>
      )
    }

    if (end.startsWith("raw")) {
      out.push(" > ")
      out.push(
        <Link
          key="raw"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/jobs/${encodeURIComponent(this.props.job.ID)}/raw`
          }}
        >
          Raw
        </Link>
      )
    }

    if (query.taskGroupId) {
      out.push(" > ")
      out.push(query.taskGroupId.split(".")[1])
    }

    if (query.taskId) {
      out.push(" > ")
      out.push(query.taskId.split(".")[2])
    }

    return out
  }

  forceRunPeriodicJobButton() {
    if (!this.props.job.Periodic) {
      return
    }

    const onClick = e => {
      this.props.dispatch({
        type: NOMAD_FORCE_PERIODIC_RUN,
        payload: this.props.params.jobId
      })
    }

    return (
      <FloatingActionButton
        mini
        style={{ display: "inline-block", borderRadius: "50%", marginRight: "10px" }}
        title="Force run periodic job"
        onClick={onClick}
      >
        <FontIcon className="material-icons" color="white">
          play_arrow
        </FontIcon>
      </FloatingActionButton>
    )
  }

  parentJobButton() {
    if (!this.props.job.ParentID) {
      return
    }

    const onClick = e => {
      this.props.router.push({
        pathname: `/nomad/${this.props.router.params.region}/jobs/${this.props.job.ParentID}/info`
      })
    }

    return (
      <FloatingActionButton
        mini
        style={{ display: "inline-block", borderRadius: "50%", marginRight: "10px" }}
        title="Go to parent job"
        onClick={onClick}
      >
        <FontIcon className="material-icons" color="white">
          arrow_upward
        </FontIcon>
      </FloatingActionButton>
    )
  }

  render() {
    if (this.props.job.ID == null) {
      return <div>Loading ...</div>
    }

    const location = this.props.location
    const end = location.pathname.split("/").pop()

    return (
      <div>
        <Helmet>
          <title>
            Job {this.props.job.Name} / {end} - Nomad - Hashi-UI
          </title>
        </Helmet>

        <div style={{ float: "left" }}>
          <h3 style={{ marginTop: "10px" }}>{this.breadcrumb()}</h3>
        </div>

        <span style={{ float: "right" }}>
          {this.parentJobButton()}
          {this.forceRunPeriodicJobButton()}
          <JobActionMenu {...this.props} />
        </span>

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
