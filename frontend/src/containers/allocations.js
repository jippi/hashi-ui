import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import AllocationList from '../components/AllocationList/AllocationList'

class Allocations extends Component {

  render () {
    return <AllocationList { ...this.props } />
  }
}

function mapStateToProps ({ allocations, nodes }) {
  return { allocations, nodes }
}

Allocations.propTypes = {
  allocations: PropTypes.array.isRequired, // eslint-disable-line no-unused-vars
  nodes: PropTypes.array.isRequired // eslint-disable-line no-unused-vars
}

export default connect(mapStateToProps)(Allocations)
