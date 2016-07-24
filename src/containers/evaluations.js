import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Evaluations extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Evaluations</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Job</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.evaluations.map((evaluation) => {
                                        return (
                                            <tr key={evaluation.ID}>
                                                <td><Link to={`/evaluations/${evaluation.ID}`}>{evaluation.ID.substring(0,8)}</Link></td>
                                                <td><Link to={`/jobs/${evaluation.JobID}`}>{evaluation.JobID.substring(0,8)}</Link></td>
                                                <td>{evaluation.Status}</td>
                                                <td>{evaluation.Type}</td>
                                                <td>{evaluation.Priority}</td>
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

function mapStateToProps({ evaluations }) {
    return { evaluations }
}

export default connect(mapStateToProps)(Evaluations)
