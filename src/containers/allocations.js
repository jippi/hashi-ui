import React, {  Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Allocations extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Allocations</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Job</th>
                                        <th>Client Status</th>
                                        <th>Desired Status</th>
                                        <th>Node</th>
                                        <th>Evaluation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.allocations.map((allocation) => {
                                        return (
                                            <tr key={allocation.ID}>
                                                <td><Link to={`/allocations/${allocation.ID}`}>{allocation.ID.substring(0,8)}</Link></td>
                                                <td><Link to={`/jobs/${allocation.JobID}`}>{allocation.JobID}</Link></td>
                                                <td>{allocation.ClientStatus}</td>
                                                <td>{allocation.DesiredStatus}</td>
                                                <td><Link to={`/nodes/${allocation.NodeID}`}>{allocation.NodeID.substring(0,8)}</Link></td>
                                                <td><Link to={`/evaluations/${allocation.EvalID}`}>{allocation.EvalID.substring(0,8)}</Link></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocations }) {
    return { allocations }
}

export default connect(mapStateToProps)(Allocations)
