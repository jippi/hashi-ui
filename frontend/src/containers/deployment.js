import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { orange500 } from "material-ui/styles/colors"
import FontIcon from "material-ui/FontIcon"
import DeploymentTopbar from "../components/DeploymentTopbar/DeploymentTopbar"
import JobLink from "../components/JobLink/JobLink"
import DeploymentLink from "../components/DeploymentLink/DeploymentLink"
import ClientLink from "../components/ClientLink/ClientLink"
import { NOMAD_WATCH_DEPLOYMENT, NOMAD_UNWATCH_DEPLOYMENT } from "../sagas/event"
import { Link, withRouter } from "react-router"

class Deployment extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: NOMAD_WATCH_DEPLOYMENT,
      payload: this.props.params.id
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_DEPLOYMENT,
      payload: this.props.params.id
    })
  }

  breadcrumb() {
    const query = this.props.location.query || {}
    const location = this.props.location
    const end = location.pathname.split("/").pop()
    let out = []

    out.push(
      <span key="jobs">
        <Link to={{ pathname: `/nomad/${this.props.router.params.region}/jobs` }}>Jobs</Link>
      </span>
    )
    out.push(" > ")

    out.push(
      <span key="job">
        <Link to={{ pathname: `/nomad/${this.props.router.params.region}/jobs/${this.props.deployment.JobID}/info` }}>
          {this.props.deployment.JobID}
        </Link>
      </span>
    )
    out.push(" > ")

    out.push(
      <span key="deployments">
        <Link
          to={{ pathname: `/nomad/${this.props.router.params.region}/jobs/${this.props.deployment.JobID}/deployments` }}
        >
          Deployments
        </Link>
      </span>
    )
    out.push(" > ")

    out.push(
      <span key="deployment">
        <Link
          to={{ pathname: `/nomad/${this.props.router.params.region}/deployments/${this.props.deployment.ID}/info` }}
        >
          v{this.props.deployment.JobVersion}
        </Link>
      </span>
    )
    out.push(" > ")

    if (end.startsWith("info")) {
      out.push(
        <Link
          key="info"
          to={{ pathname: `/nomad/${this.props.router.params.region}/deployments/${this.props.deployment.ID}/info` }}
        >
          Info
        </Link>
      )
    }

    if (end.startsWith("allocations")) {
      out.push(
        <Link
          key="allocations"
          to={{
            pathname: `/nomad/${this.props.router.params.region}/deployments/${this.props.deployment.ID}/allocations`
          }}
        >
          Allocations
        </Link>
      )
    }

    if (end.startsWith("raw")) {
      out.push(
        <Link
          key="raw"
          to={{ pathname: `/nomad/${this.props.router.params.region}/deployments/${this.props.deployment.ID}/raw` }}
        >
          Raw
        </Link>
      )
    }

    return out
  }

  render() {
    if (this.props.deployment.ID == null) {
      return <div>Loading deployment ...</div>
    }

    return (
      <div>
        <h3 style={{ marginTop: "10px", marginBottom: "15px" }}>
          {this.breadcrumb()}
        </h3>

        <DeploymentTopbar {...this.props} />

        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps({ deployment, deployments, nodes }) {
  return { deployment, deployments, nodes }
}

Deployment.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  deployment: PropTypes.object.isRequired,
  deployments: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line no-unused-vars
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(withRouter(Deployment))
