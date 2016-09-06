import React from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../link'
import Table from '../table'

const JobAllocs = ({ allocations, job }) => {

        // build the job allocation table
        const allocs = allocations.filter((allocation) => {
            return (allocation.JobID === job.ID);
        }).map((allocation) => {
            return (
                <tr key={allocation.ID}>
                    <td><NomadLink allocId={allocation.ID} short="true"/></td>
                    <td>{allocation.ClientStatus}</td>
                    <td>{allocation.DesiredStatus}</td>
                    <td><NomadLink nodeId={allocation.NodeID} short="true"/></td>
                    <td><NomadLink evalId={allocation.EvalID} short="true"/></td>
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
