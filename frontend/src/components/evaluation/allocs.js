import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation_list';

const EvalAlloc = ({ allocations, evaluation, nodes }) => {
    const allocs = allocations.filter(allocation => allocation.EvalID === evaluation.ID);

    return (
      <AllocationList allocations={ allocs } nodes={ nodes } />
    );
};

function mapStateToProps({ evaluation, allocations, nodes }) {
    return { evaluation, allocations, nodes };
}

EvalAlloc.propTypes = {
    allocations: PropTypes.isRequired,
    evaluation: PropTypes.isRequired,
    nodes: PropTypes.isRequired,
};

export default connect(mapStateToProps)(EvalAlloc);
