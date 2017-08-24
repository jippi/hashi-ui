import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationList from "../AllocationList/AllocationList"
import {
  NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS,
  NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../../sagas/event"

class DeploymentAllocations extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS, payload: this.props.params.id })
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS, payload: this.props.params.id })
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  render() {
    return (
      <AllocationList
        showJobColumn={false}
        allocations={this.props.deploymentAllocations}
        location={this.props.location}
        nodes={this.props.nodes}
      />
    )
  }
}

function mapStateToProps({ deploymentAllocations, nodes }) {
  return { deploymentAllocations, nodes }
}

DeploymentAllocations.defaultProps = {
  deploymentAllocations: [],
  nodes: [],
  params: {},
  location: {}
}

DeploymentAllocations.propTypes = {
  deploymentAllocations: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(DeploymentAllocations)
