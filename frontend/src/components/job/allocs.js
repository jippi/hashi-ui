import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation_list';

const JobAllocs = ({ allocations, nodes }) => {
    const allocs = allocations.filter(allocation =>
        allocation.JobID === this.props.job.ID
    );

    return (
      <div className="tab-pane active">
        <AllocationList allocations={ allocs } nodes={ nodes } />
      </div>
    );
};

function mapStateToProps({ allocations, job, nodes }) {
    return { allocations, job, nodes };
}

JobAllocs.defaultProps = {
    allocations: {},
    nodes: {},
};

JobAllocs.propTypes = {
    allocations: PropTypes.isRequired,
    nodes: PropTypes.isRequired,
};

export default connect(mapStateToProps)(JobAllocs);
