import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link'
import DisplayBoolean from '../components/display/boolean'
import DisplayNodeStatus from '../components/display/node_status'

class Clients extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Clients</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Drain</th>
                                        <th>Datacenter</th>
                                        <th>Class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.nodes.map((node) => {
                                        return (
                                            <tr key={node.ID}>
                                                <td><NomadLink nodeId={node.ID} short="true"/></td>
                                                <td>{node.Name}</td>
                                                <td><DisplayNodeStatus value={node.Status}/></td>
                                                <td><DisplayBoolean value={node.Drain} /></td>
                                                <td>{node.Datacenter}</td>
                                                <td>{node.Class ? node.Class : "<none>"}</td>
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

function mapStateToProps({ nodes }) {
    return { nodes }
}

export default connect(mapStateToProps)(Clients)
