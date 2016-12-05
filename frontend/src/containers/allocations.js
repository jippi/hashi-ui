import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../components/AllocationList/AllocationList';

class Allocations extends Component {

  render() {
    return <AllocationList { ...this.props } />;
  }
}

function mapStateToProps({ allocations, nodes }) {
  return { allocations, nodes };
}

Allocations.propTypes = {
  allocations: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Allocations);
