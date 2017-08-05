import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationList from "../AllocationList/AllocationList"
import {
  NOMAD_WATCH_ALLOCS_SHALLOW,
  NOMAD_UNWATCH_ALLOCS_SHALLOW,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../../sagas/event"

class JobAllocations extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_ALLOCS_SHALLOW })
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_ALLOCS_SHALLOW })
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  render() {
    const allocs = this.props.allocations.filter(allocation => allocation.JobID === this.props.params.jobId)

    return (
      <AllocationList
        showJobColumn={false}
        allocations={allocs}
        location={this.props.location}
        nodes={this.props.nodes}
      />
    )
  }
}

function mapStateToProps({ allocations, nodes }) {
  return { allocations, nodes }
}

JobAllocations.defaultProps = {
  allocations: [],
  nodes: [],
  params: {},
  location: {}
}

JobAllocations.propTypes = {
  allocations: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(JobAllocations)
