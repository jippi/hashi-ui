import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation/list';

class ClientAllocations extends PureComponent {

    render() {
        const nodeId = this.props.params.nodeId;
        const allocs = this.props.allocations.filter(allocation => allocation.NodeID === nodeId);

        return (
          <div className="tab-pane active">
            <AllocationList showClientColumn={ false } allocations={ allocs } />
          </div>
        );
    }
}

function mapStateToProps({ allocations }) {
    return { allocations };
}

ClientAllocations.defaultProps = {
    allocations: [],
    params: {},
};

ClientAllocations.propTypes = {
    allocations: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientAllocations);
