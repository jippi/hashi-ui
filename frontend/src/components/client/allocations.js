import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation/list';

const ClientAllocations = ({ allocations, node, nodes }) => {
    const allocs = allocations.filter(allocation =>
        allocation.NodeID === node.ID
    );

    return (
      <div className="tab-pane active">
        <AllocationList showClientColumn={ false } allocations={ allocs } nodes={ nodes } />
      </div>
    );
};

function mapStateToProps({ allocations, node, nodes }) {
    return { allocations, node, nodes };
}

ClientAllocations.defaultProps = {
    allocations: [],
    node: [],
};

ClientAllocations.propTypes = {
    allocations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(ClientAllocations);
