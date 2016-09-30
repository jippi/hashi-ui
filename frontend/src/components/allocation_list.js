import React, { Component } from 'react';
import { NomadLink } from './link';
import DisplayTime from './time'
import ReactTooltip from 'react-tooltip'

class AllocationList extends Component {

    renderDesiredStatus(allocation) {
        if (allocation.DesiredDescription) {
            return (
                <div>
                    <ReactTooltip id={'tooltip-' + allocation.ID}>{allocation.DesiredDescription}</ReactTooltip>
                    <span data-tip data-for={'tooltip-' + allocation.ID} className="dotted">{allocation.DesiredStatus}</span>
                </div>
            )
        }

        return (<div>{allocation.DesiredStatus}</div>)
    }

    render() {
        return (
            <table className="table table-hover table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Job</th>
                    <th>Task Group</th>
                    <th>Task</th>
                    <th>Client Status</th>
                    <th>Desired Status</th>
                    <th>Node</th>
                    <th>Evaluation</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {this.props.allocations.map((allocation) => {
                    return (
                        <tr key={allocation.ID}>
                            <td><NomadLink allocId={allocation.ID} short="true" /></td>
                            <td><NomadLink jobId={allocation.JobID} short="true" /></td>
                            <td><NomadLink jobId={allocation.JobID} taskGroupId={allocation.TaskGroupId}>{allocation.TaskGroup}</NomadLink></td>
                            <td>{allocation.Name}</td>
                            <td>{allocation.ClientStatus}</td>
                            <td>{this.renderDesiredStatus(allocation)}</td>
                            <td><NomadLink nodeId={allocation.NodeID} nodeList={this.props.nodes} short="true" /></td>
                            <td><NomadLink evalId={allocation.EvalID} short="true" /></td>
                            <td><DisplayTime time={allocation.CreateTime} /></td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        );
    }
}

export default AllocationList