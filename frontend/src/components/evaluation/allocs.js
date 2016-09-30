import React, { Component } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocations'

class EvalAlloc extends Component {

    render() {
        const allocs = this.props.allocations
            .filter((allocation) => {
                return (allocation.EvalID === this.props.evaluation.ID);
            })

        return (
            <AllocationList allocations={allocs} nodes={this.props.nodes} />
        )
    }
}

function mapStateToProps({ evaluation, allocations, nodes }) {
    return { evaluation, allocations, nodes }
}

export default connect(mapStateToProps)(EvalAlloc)
