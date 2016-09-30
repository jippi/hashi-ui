import React, { Component } from "react";
import { connect } from "react-redux";
import { NomadLink } from "../link";
import MetaDisplay from '../meta'

const allocProps = [
    "ID",
    "Name",
    "ClientStatus",
    "ClientDescription",
    "DesiredStatus",
    "DesiredDescription"
];

class AllocInfo extends Component {

    render() {
        const allocation = this.props.allocation;
        const jobId = allocation["JobID"];
        const nodeId = allocation["NodeID"];
        const taskGroupId = allocation["TaskGroupId"]

        let allocValues = {};
        allocProps.map((allocProp) => {
            allocValues[allocProp] = allocation[allocProp]
            return null
        });

        allocValues.Job = <NomadLink jobId={jobId} />
        allocValues.TaskGroup = <NomadLink jobId={jobId} taskGroupId={taskGroupId}>{allocation.TaskGroup}</NomadLink>
        allocValues.Node = <NomadLink nodeId={nodeId} nodeList={this.props.nodes} />

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Allocation Properties</legend>
                    <MetaDisplay metaBag={allocValues} sortKeys={false} />

                    <br />

                    {states}

                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation, nodes }) {
    return { allocation, nodes }
}

export default connect(mapStateToProps)(AllocInfo);
