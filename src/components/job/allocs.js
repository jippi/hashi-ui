import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import Table from '../table'

const JobAllocs = ({ allocations, job }) => {

        // build the job allocation table
        const allocs = allocations.filter((allocation) => {
            return (allocation.JobID === job.ID);
        }).map((allocation) => {
            return (
                <tr key={allocation.ID}>
                    <td><Link to={`/allocations/${allocation.ID}`}>{allocation.ID.substring(0,8)}</Link></td>
                    <td>{allocation.ClientStatus}</td>
                    <td>{allocation.DesiredStatus}</td>
                    <td><Link to={`/nodes/${allocation.NodeID}`}>{allocation.NodeID.substring(0,8)}</Link></td>
                    <td><Link to={`/evaluations/${allocation.EvalID}`}>{allocation.EvalID.substring(0,8)}</Link></td>
                </tr>
            )
        })

        return (
            <div className="tab-pane active">
                {(allocations.length > 0) ?
                    <Table classes="table table-hover table-striped" headers={["ID", "Client Status", "Desired Status", "Node", "Evaluation" ]} body={allocs} />
                    : null
                }
            </div>
        )
}

function mapStateToProps({ allocations, job }) {
    return { allocations, job }
}

export default connect(mapStateToProps)(JobAllocs);
