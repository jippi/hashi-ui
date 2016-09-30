import React from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../link'
import Table from '../table'
import DisplayTime from '../time'

const JobAllocs = ({ allocations, job, nodes }) => {
    const allocs = allocations.filter((allocation) => {
        return (allocation.JobID === job.ID);
    }).map((allocation) => {
        return (
            <tr key={allocation.ID}>
                <td><NomadLink allocId={allocation.ID} short="true"/></td>
                <td>{allocation.DesiredStatus}</td>
                <td>{allocation.ClientStatus}</td>
                <td><NomadLink nodeId={allocation.NodeID} nodeList={nodes} short="true"/></td>
                <td><NomadLink evalId={allocation.EvalID} short="true"/></td>
                <td><DisplayTime time={allocation.CreateTime} /></td>
            </tr>
        )
    })

    return (
        <div className="tab-pane active">
            {(allocations.length > 0) ?
                <Table classes="table table-hover table-striped" headers={["ID", "Desired Status", "Client Status", "Node", "Evaluation", "Time" ]} body={allocs} />
                : null
            }
        </div>
    )
}

function mapStateToProps({ allocations, job, nodes }) {
    return { allocations, job, nodes }
}

export default connect(mapStateToProps)(JobAllocs);
