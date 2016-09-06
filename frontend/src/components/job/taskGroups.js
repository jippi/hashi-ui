import React, {Component} from "react";
import {connect} from "react-redux";
import {NomadLink} from "../link";
import Table from "../table";
import JSON from "../json";

class JobTaskGroups extends Component {
    render() {
        const job = this.props.job;

        const taskGroups = [];
        const taskGroupHeaders = [
            "ID",
            "Name",
            "Count",
            "Constraints",
            "Meta",
            "Restart Policy",
        ];
        job.TaskGroups.forEach((taskGroup) => {
            taskGroups.push(
                <tr key={taskGroup.ID}>
                    <td><NomadLink taskGroupId={taskGroup.ID} jobId={job.ID} short="true"/></td>
                    <td>{taskGroup.Name}</td>
                    <td>{taskGroup.Count}</td>
                    <td>{taskGroup.Constraints || "<none>"}</td>
                    <td>{taskGroup.Meta || "<none>" }</td>
                    <td>{taskGroup.RestartPolicy.Mode}</td>
                </tr>
            )
        });

        let taskGroupId = this.props.location.query['taskGroupId'];

        //
        // Auto-select first task group if only one is available.
        //
        if (!taskGroupId && job.TaskGroups.length === 1) {
            taskGroupId = job.TaskGroups[0].ID;
        }
        return (
            <div className="tab-pane active">
                <div className="row">
                    <div className="col-md-6">
                        <legend>Task Groups</legend>
                        {(taskGroups.length > 0) ?
                            <Table classes="table table-hover table-striped" headers={taskGroupHeaders}
                                   body={taskGroups}/>
                            : null
                        }
                    </div>
                    <div className="col-md-6">
                        <legend>Task Group: {taskGroupId}</legend>
                        {job.TaskGroups.filter((taskGroup) => {
                            return taskGroup.ID === taskGroupId
                        }).map((taskGroup) => {
                            return (
                                <JSON json={taskGroup}/>
                            )
                        }).pop()}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps({job}) {
    return {job}
}

export default connect(mapStateToProps)(JobTaskGroups);
