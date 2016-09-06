import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link'

class Jobs extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Jobs</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Type</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.jobs.map((job) => {
                                        return (
                                            <tr key={job.ID}>
                                                <td><NomadLink jobId={job.ID} short="true"/></td>
                                                <td>{job.Type}</td>
                                                <td>{job.Priority}</td>
                                                <td>{job.Status}</td>
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

function mapStateToProps({ jobs }) {
    return { jobs }
}

export default connect(mapStateToProps)(Jobs)
