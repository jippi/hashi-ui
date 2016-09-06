import React, {Component} from "react";
import {connect} from "react-redux";
import {NomadLink} from "../link";

class AllocInfo extends Component {

    render() {

        const allocProps = [
            "ID",
            "Name",
            "TaskGroup",
            "DesiredStatus",
            "ClientStatus",
        ];

        const jobId = this.props.allocation["JobID"];
        const nodeId = this.props.allocation["NodeID"];
        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Allocation Properties</legend>
                    <dl className="dl-horizontal">
                        {allocProps.map((allocProp) => {
                            return (
                                <div key={allocProp}>
                                    <dt>{allocProp}</dt>
                                    <dd>{this.props.allocation[allocProp]}</dd>
                                </div>
                            )
                        }, this)}
                        <div key="Job">
                            <dt>{"Job"}</dt>
                            <dd><NomadLink jobId={jobId}/></dd>
                        </div>
                        <div key="Node">
                            <dt>{"Node"}</dt>
                            <dd><NomadLink nodeId={nodeId}/></dd>
                        </div>
                    </dl>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation }) {
    return { allocation }
}

export default connect(mapStateToProps)(AllocInfo);
