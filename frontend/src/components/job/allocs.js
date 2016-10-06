import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation/list';

const JobAllocs = ({ allocations, nodes, job }) => {
    const allocs = allocations.filter(allocation =>
        allocation.JobID === job.ID
    );

    return (
      <div className="tab-pane active">
        <AllocationList showJobColumn={ false } allocations={ allocs } nodes={ nodes } />
      </div>
    );
};

function mapStateToProps({ allocations, job, nodes }) {
    return { allocations, job, nodes };
}

JobAllocs.defaultProps = {
    allocations: [],
    nodes: [],
};

JobAllocs.propTypes = {
    allocations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    job: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobAllocs);
