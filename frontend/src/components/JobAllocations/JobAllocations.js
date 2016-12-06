import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import AllocationList from '../AllocationList/AllocationList'

class JobAllocations extends PureComponent {

  render () {
    const allocs = this.props.allocations.filter(allocation => allocation.JobID === this.props.params.jobId)

    return (
      <AllocationList
        showJobColumn={ false }
        allocations={ allocs }
        location={ this.props.location }
        nodes={ this.props.nodes }
      />
    )
  }
}

function mapStateToProps ({ allocations, nodes }) {
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
  location: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobAllocations)

