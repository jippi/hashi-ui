import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Members extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Members</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Addr</th>
                                        <th>Port</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.members.map((member) => {
                                        return (
                                            <tr key={member.ID}>
                                                <td><Link to={`/members/${member.ID}`}>{member.ID}</Link></td>
                                                <td>{member.Name}</td>
                                                <td>{member.Addr}</td>
                                                <td>{member.Port}</td>
                                                <td>{member.Status}</td>
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

function mapStateToProps({ members }) {
    return { members }
}

export default connect(mapStateToProps)(Members)
