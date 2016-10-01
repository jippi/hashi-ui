import React, { Component } from 'react';
import { NomadLink } from './link';

class EvaluationList extends Component {

    render() {
        return (
            <table className="table table-hover table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Node</th>
                </tr>
            </thead>
            <tbody>
                {this.props.evaluations.map((evaluation) => {
                    return (
                        <tr key={evaluation.ID}>
                            <td><NomadLink evalId={evaluation.ID} short="true" /></td>
                            <td><NomadLink jobId={evaluation.JobID} short="true" /></td>
                            <td>{evaluation.Status}</td>
                            <td>{evaluation.Type}</td>
                            <td>{evaluation.Priority}</td>
                            <td><NomadLink nodeId={evaluation.NodeID} nodeList={this.props.nodes} short="true"/></td>
                        </tr>
                    )
                })}
            </tbody>
        </table>)
    }
}

export default EvaluationList
