import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import DeploymentList from "../DeploymentList/DeploymentList"
import { NOMAD_WATCH_JOB_DEPLOYMENTS, NOMAD_UNWATCH_JOB_DEPLOYMENTS } from "../../sagas/event"

class JobDeployments extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_JOB_DEPLOYMENTS, payload: this.props.params.jobId })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_JOB_DEPLOYMENTS, payload: this.props.params.jobId })
  }

  render() {
    return <DeploymentList deployments={this.props.jobDeployments} showJob={false} {...this.props} />
  }
}

function mapStateToProps({ jobDeployments }) {
  return { jobDeployments }
}

JobDeployments.propTypes = {
  jobDeployments: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(JobDeployments)
