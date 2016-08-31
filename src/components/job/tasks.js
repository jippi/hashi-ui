import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import Table from "../table";
import shortUUID from "../uuid";
import JSON from "../json";

class JobTasks extends Component {
    render() {
        const job = this.props.job;

        const tasks = [];
        const taskHeaders = [
            "ID",
            "Name",
            "Group",
            "Driver",
            "CPU",
            "Memory",
            "Disk",
        ];
        job.TaskGroups.forEach((taskGroup) => {
            taskGroup.Tasks.forEach((task) => {
                task.ID = task.Name;
                taskGroup.ID = taskGroup.Name;
                tasks.push(
                    <tr key={task.ID}>
                        <td><Link to={`/jobs/${job.ID}/tasks`}
                                  query={{taskGroupId: taskGroup.ID, taskId: task.ID}}>{shortUUID(task.ID)}</Link>
                        </td>
                        <td>{task.Name}</td>
                        <td><Link to={`/jobs/${job.ID}/taskGroups`}
                                  query={{taskGroupId: taskGroup.ID}}>{shortUUID(taskGroup.ID)}</Link></td>
                        <td>{task.Driver}</td>
                        <td>{task.Resources.CPU}</td>
                        <td>{task.Resources.MemoryMB}</td>
                        <td>{task.Resources.DiskMB}</td>
                    </tr>
                )
            })
        });

        let taskGroupId = this.props.location.query['taskGroupId'];
        let taskId = this.props.location.query['taskId'];

        //
        // Auto-select first task if only one is available.
        //
        if (!taskGroupId && !taskId && tasks.length === 1) {
            job.TaskGroups.forEach((taskGroup) => {
                taskGroup.Tasks.forEach((task) => {
                    taskGroupId = taskGroup.ID;
                    taskId = task.ID;
                })
            })
        }
        return (
            <div className="tab-pane active">
                <div className="row">
                    <div className="col-md-6">
                        <legend>Tasks</legend>
                        {(tasks.length > 0) ?
                            <Table classes="table table-hover table-striped" headers={taskHeaders} body={tasks}/>
                            : null
                        }
                    </div>
                    <div className="col-md-6">
                        <legend>Task: { (taskGroupId && taskId) ? taskGroupId + '/' + taskId : null}</legend>
                        {this.props.job.TaskGroups.filter((taskGroup) => {
                            return taskGroup.ID === taskGroupId
                        }).map((taskGroup) => {
                            return taskGroup.Tasks.filter((task) => {
                                return task.ID === taskId
                            }).map((task) => {
                                return (
                                    <JSON json={task}/>
                                )
                            }).pop()
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

export default connect(mapStateToProps)(JobTasks);
