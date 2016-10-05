import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import NomadLink from '../link';
import Table from '../table';
import Json from '../json';

const taskHeaders = [
    'ID',
    'Name',
    'Group',
    'Driver',
    'CPU',
    'Memory',
    'Disk',
];

const JobTasks = ({ job, location }) => {
    const tasks = [];
    job.TaskGroups.forEach((taskGroup) => {
        taskGroup.Tasks.forEach((task) => {
            tasks.push(
              <tr key={ task.ID }>
                <td>
                  <NomadLink
                    taskId={ task.ID }
                    taskGroupId={ taskGroup.ID }
                    jobId={ job.ID }
                    short="true"
                  />
                </td>
                <td>{task.Name}</td>
                <td>
                  <NomadLink taskGroupId={ taskGroup.ID } jobId={ job.ID } >
                    { taskGroup.Name }
                  </NomadLink>
                </td>
                <td>{ task.Driver }</td>
                <td>{ task.Resources.CPU }</td>
                <td>{ task.Resources.MemoryMB }</td>
                <td>{ task.Resources.DiskMB }</td>
              </tr>
            );
        });
    });

    let taskGroupId = location.query.taskGroupId;
    let taskId = location.query.taskId;

    // Auto-select first task if only one is available.
    if (!taskGroupId && !taskId && tasks.length === 1) {
        job.TaskGroups.forEach((taskGroup) => {
            taskGroup.Tasks.forEach((task) => {
                taskGroupId = taskGroup.ID;
                taskId = task.ID;
            });
        });
    }
    return (
      <div className="tab-pane active">
        <div className="row">
          <div className="col-md-6">
            <legend>Tasks</legend>
            { (tasks.length > 0) ?
              <Table
                classes="table table-hover table-striped"
                headers={ taskHeaders }
                body={ tasks }
              />
              : null
            }
          </div>
          <div className="col-md-6">
            <legend>Task: { (taskGroupId && taskId) ? `${taskGroupId}/${taskId}` : null}</legend>
            { job.TaskGroups
                .filter(taskGroup => taskGroup.ID === taskGroupId)
                .map(taskGroup => taskGroup.Tasks
                    .filter(task => task.ID === taskId)
                    .map(task => <Json json={ task } />)
                    .pop())
                .pop()}
          </div>
        </div>
      </div>
    );
};

function mapStateToProps({ job }) {
    return { job };
}

JobTasks.propTypes = {
    job: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobTasks);
