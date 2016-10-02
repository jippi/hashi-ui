import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../components/allocation_list';

const Allocations = ({ allocations, nodes }) =>
  <div className="row">
    <div className="col-md-12">
      <div className="card">
        <div className="header">
          <h4 className="title">
            Allocations
          </h4>
        </div>
        <div className="content table-responsive table-full-width">
          <AllocationList allocations={ allocations } nodes={ nodes } />
        </div>
      </div>
    </div>
  </div>;

function mapStateToProps({ allocations, nodes }) {
    return { allocations, nodes };
}

Allocations.propTypes = {
    allocations: PropTypes.isRequired,
    nodes: PropTypes.isRequired,
};

export default connect(mapStateToProps)(Allocations);
