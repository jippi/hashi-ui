import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link';
import { relativeTimestamp } from '../helpers/time'

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
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.evaluations.map((evaluation) => {
                                        return (
                                            <tr key={evaluation.ID}>
                                                <td><NomadLink evalId={evaluation.ID} short="true"/></td>
                                                <td><NomadLink jobId={evaluation.JobID} short="true"/></td>
                                                <td>{evaluation.Status}</td>
                                                <td>{evaluation.Type}</td>
                                                <td>{evaluation.Priority}</td>
                                                <td>{relativeTimestamp(evaluation.Time)}</td>
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
