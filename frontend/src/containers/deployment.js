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

  render() {
    if (this.props.deployment.ID == null) {
      return <div>Loading deployment ...</div>
    }

    return (
      <div>
        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h3>
            Deployment: &nbsp;
            <JobLink jobId={this.props.deployment.JobID} />
            &nbsp; v{this.props.deployment.JobVersion}
          </h3>

          <br />

          <DeploymentTopbar {...this.props} />

          <br />

          {this.props.children}
        </div>
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

export default connect(mapStateToProps)(Deployment)
