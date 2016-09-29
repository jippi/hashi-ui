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
                    <tr key={task.ID}>
                        <td>{taskGroup.Name} / {task.Name}</td>
                        <td>{task.Driver}</td>
                        <td>{task.Resources.CPU}</td>
                        <td>{task.Resources.MemoryMB}</td>
                        <td>{task.Resources.DiskMB}</td>
                    </tr>
                )
                return null
            })

            let meta = [];
            let metaTag = '<none>';

            Object.keys(taskGroup.Meta || {}).forEach(function(key) {
                meta.push(<dt key={key + 'dt'}>{key}</dt>);
                meta.push(<dd key={key + 'dd'}>{taskGroup.Meta[key]}</dd>);
            });

            if (meta.length > 0) {
                metaTag = <dl className="dl-horizontal">{meta}</dl>
            }

            return (
                <tr key={taskGroup.ID}>
                    <td>{taskGroup.Name}</td>
                    <td>{taskGroup.Count}</td>
                    <td>{metaTag}</td>
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
                            let jobPropValue = this.props.job[jobProp]
                            if (Array.isArray(jobPropValue)) {
                                jobPropValue = jobPropValue.join(', ')
                            }

                            return (
                                <div key={jobProp}>
                                    <dt>{jobProp}</dt>
                                    <dd>{jobPropValue}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>

                    <br />

                    <legend>Task Groups</legend>
                    {(taskGroups.length > 0) ?
                        <Table classes="table table-hover table-striped" headers={["Name", "Count", "Meta", "Restart Policy" ]} body={taskGroups} />
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
