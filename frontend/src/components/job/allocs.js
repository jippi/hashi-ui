import React, { Component } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../allocation_list'

class JobAllocs extends Component {

	render() {
		const allocs = this.props.allocations.filter((allocation) => {
			return (allocation.JobID === this.props.job.ID);
		})

		return (
			<div className="tab-pane active">
				<AllocationList allocations={allocs} nodes={this.props.nodes} />
			</div>
		)
	}
}

function mapStateToProps({ allocations, job, nodes }) {
	return { allocations, job, nodes }
}

export default connect(mapStateToProps)(JobAllocs);
