import React, {  Component } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link';
import { relativeTimestamp } from '../helpers/time'
import ReactTooltip from 'react-tooltip'

class Allocations extends Component {

    renderDesiredStatus(allocation) {
        if (allocation.DesiredDescription) {
            return (
                <div>
                    <ReactTooltip id={allocation.ID}>
                        {allocation.DesiredDescription}
                    </ReactTooltip>

                    <div data-tip data-for={allocation.ID}>{allocation.DesiredStatus}</div>
                </div>
            )
        }
        return (<div>{allocation.DesiredStatus}</div>)
    }

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
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.allocations.map((allocation) => {
                                        return (
                                            <tr key={allocation.ID}>
                                                <td><NomadLink allocId={allocation.ID} short="true"/></td>
                                                <td><NomadLink jobId={allocation.JobID} short="true"/></td>
                                                <td>{allocation.ClientStatus}</td>
                                                <td>{this.renderDesiredStatus(allocation)}</td>
                                                <td><NomadLink nodeId={allocation.NodeID} short="true"/></td>
                                                <td><NomadLink evalId={allocation.EvalID} short="true"/></td>
                                                <td>{relativeTimestamp(allocation.CreateTime)}</td>
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
