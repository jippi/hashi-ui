import React, { Component } from 'react';
import { connect } from 'react-redux';

import Table from '../table'

class JobInfo extends Component {

    render() {
        const tasks = []

        // Build the task groups table
        const taskGroups = this.props.job.TaskGroups.map((taskGroup) => {
             taskGroup.Tasks.map((task) => {
                tasks.push(
                    <tr key={task.Name}>
                        <td>{task.Name}</td>
                        <td>{task.Driver}</td>
                        <td>{task.Resources.CPU}</td>
                        <td>{task.Resources.MemoryMB}</td>
                        <td>{task.Resources.DiskMB}</td>
                    </tr>
                )
                return null
            })

            return (
                <tr key={taskGroup.Name}>
                    <td>{taskGroup.Name}</td>
                    <td>{taskGroup.Count}</td>
                    <td>{taskGroup.Constraints || "<none>"}</td>
                    <td>{taskGroup.Meta || "<none>" }</td>
                    <td>{taskGroup.RestartPolicy.Mode}</td>
                </tr>
            )
        })

        const jobProps = ["ID", "Name", "Region", "Datacenters", "Status", "Priority"]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Job Properties</legend>
                    <dl className="dl-horizontal">
                        {jobProps.map((jobProp) => {
                            return (
                                <div key={jobProp}>
                                    <dt>{jobProp}</dt>
                                    <dd>{this.props.job[jobProp]}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>
                    <br />
                    <legend>Task Groups</legend>
                    {(taskGroups.length > 0) ?
                        <Table classes="table table-hover table-striped" headers={["Name", "Count", "Constraints", "Meta", "Restart Policy" ]} body={taskGroups} />
                        : null
                    }

                    <br /><br />
                    <legend>Tasks</legend>
                    {(tasks.length > 0) ?
                        <Table classes="table table-hover table-striped" headers={["Name", "Driver", "CPU", "Memory", "Disk" ]} body={tasks} />
                        : null
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps({ job, allocations, evaluations }) {
    return { job, allocations, evaluations }
}

export default connect(mapStateToProps)(JobInfo);
