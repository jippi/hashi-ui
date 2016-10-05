import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation/list';

const ClientAllocations = ({ allocations, node }) => {
    const allocs = allocations.filter(allocation =>
        allocation.NodeID === node.ID
    );

    return (
      <div className="tab-pane active">
        <AllocationList showClientColumn={ false } allocations={ allocs } />
      </div>
    );
};

function mapStateToProps({ allocations, node }) {
    return { allocations, node };
}

ClientAllocations.defaultProps = {
    allocations: [],
    node: {},
};

ClientAllocations.propTypes = {
    allocations: PropTypes.array.isRequired,
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientAllocations);
