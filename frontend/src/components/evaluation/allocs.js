import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation/list';

const EvaluationAllocs = ({ allocations, evaluation, nodes }) => {
    const allocs = allocations.filter(allocation => allocation.EvalID === evaluation.ID);

    return (
      <AllocationList allocations={ allocs } nodes={ nodes } containerClassName="nested-content" />
    );
};

function mapStateToProps({ evaluation, allocations, nodes }) {
    return { evaluation, allocations, nodes };
}

EvaluationAllocs.propTypes = {
    allocations: PropTypes.array.isRequired,
    evaluation: PropTypes.object.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(EvaluationAllocs);
