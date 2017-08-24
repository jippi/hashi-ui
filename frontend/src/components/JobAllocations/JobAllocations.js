import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationList from "../AllocationList/AllocationList"
import {
  NOMAD_WATCH_JOB_ALLOCATIONS,
  NOMAD_UNWATCH_JOB_ALLOCATIONS,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../../sagas/event"

class JobAllocations extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_JOB_ALLOCATIONS, payload: this.props.params.jobId })
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_JOB_ALLOCATIONS, payload: this.props.params.jobId })
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  render() {
    return (
      <AllocationList
        showJobColumn={false}
        allocations={this.props.jobAllocations}
        location={this.props.location}
        nodes={this.props.nodes}
      />
    )
  }
}

function mapStateToProps({ jobAllocations, nodes }) {
  return { jobAllocations, nodes }
}

JobAllocations.defaultProps = {
  jobAllocations: [],
  nodes: [],
  params: {},
  location: {}
}

JobAllocations.propTypes = {
  jobAllocations: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(JobAllocations)
