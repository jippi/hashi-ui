import React, { Component } from 'react';
import { connect } from 'react-redux';

import Table from '../table'

class JobInfo extends Component {

    collectMeta(metaBag, dtWithClass = 'default') {
        let meta = [];
        let metaTag = '<none>';

        Object.keys(metaBag || {}).sort().forEach(function(key) {
            meta.push(<dt className={dtWithClass} key={key + 'dt'}>{key}</dt>);
            meta.push(<dd key={key + 'dd'}>{metaBag[key]}</dd>);
        });

        if (meta.length > 0) {
            metaTag = <dl className="dl-horizontal">{meta}</dl>
        }

        return metaTag
    }

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

            return (
                <tr key={taskGroup.ID}>
                    <td>{taskGroup.Name}</td>
                    <td>{taskGroup.Count}</td>
                    <td>{taskGroup.Tasks.length}</td>
                    <td>{this.collectMeta(taskGroup.Meta)}</td>
                    <td>{taskGroup.RestartPolicy.Mode}</td>
                </tr>
            )
        })

        const jobProps = ["ID", "Name", "Region", "Datacenters", "Status", "Priority"]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 col-sx-12">
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
                        </div>

                        <div className="col-lg-6 col-md-6 col-sm-12 col-sx-12">
                            <legend>Meta Properties</legend>
                            {this.collectMeta(this.props.job.Meta || {}, "wide")}
                        </div>
                    </div>
                    <br />

                    <legend>Task Groups</legend>
                    {(taskGroups.length > 0) ?
                        <Table classes="table table-hover table-striped" headers={["Name", "Count", "Tasks", "Meta", "Restart Policy" ]} body={taskGroups} />
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
