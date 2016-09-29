import React, {Component} from "react";
import { connect } from "react-redux";
import { NomadLink } from "../link";
import { collectMeta } from '../../helpers/meta'

const allocProps = [
    "ID",
    "Name",
    "DesiredStatus",
    "ClientStatus",
];

class AllocInfo extends Component {

    render() {
        const jobId = this.props.allocation["JobID"];
        const nodeId = this.props.allocation["NodeID"];
        const taskGroupId = this.props.allocation["taskGroupId"]

        let allocValues = {};
        allocProps.map((allocProp) => {
            allocValues[allocProp] = this.props.allocation[allocProp]
        });

        allocValues.Job = <NomadLink jobId={jobId} />
        allocValues.TaskGroup = <NomadLink nodeId={nodeId} taskGroupId={taskGroupId} />
        allocValues.Node = <NomadLink nodeId={nodeId} nodeList={this.props.nodes} />
        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Allocation Properties</legend>
                    {collectMeta(allocValues, "default", false)}
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation, nodes }) {
    return { allocation, nodes }
}

export default connect(mapStateToProps)(AllocInfo);
