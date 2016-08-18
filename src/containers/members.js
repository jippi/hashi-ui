import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Members extends Component {

    render() {
        const leader = this.props.members[0]
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
                                        <th>Address</th>
                                        <th>Port</th>
                                        <th>Status</th>
                                        <th>Leader</th>
                                        <th>Protocol</th>
                                        <th>Build</th>
                                        <th>Datacenter</th>
                                        <th>Region</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.members.map((member) => {
                                        let isLeader = member.ID === leader.ID
                                        return (
                                            <tr key={member.ID}>
                                                <td><Link to={`/members/${member.ID}`}>{member.ID.substring(0,8)}</Link></td>
                                                <td>{member.Name}</td>
                                                <td>{member.Addr}</td>
                                                <td>{member.Port}</td>
                                                <td>{member.Status}</td>
                                                <td>{isLeader ? 'true' : 'false'}</td>
                                                <td>{member.ProtocolCur}</td>
                                                <td>{member.Tags["build"]}</td>
                                                <td>{member.Tags["dc"]}</td>
                                                <td>{member.Tags["region"]}</td>
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
