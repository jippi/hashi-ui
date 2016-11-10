import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NomadLink from '../link';
import Table from '../table';
import { JsonEdit } from '../json';
import {
    RUN_JOB,
    EDIT_TASK
} from '../../sagas/event';

const taskHeaders = [
    'ID',
    'Name',
    'Group',
    'Driver',
    'CPU',
    'Memory',
    'Disk',
];

class JobTasks extends Component {

    constructor(props) {
        super(props);
        this.onRun = () => this.run();
        this.onChange = (json) => this.change(json);
    }

    componentWillReceiveProps(props){
        const {dispatch, location, job, currentTask} = props;
        const currentTaskId = this.props.location.query.taskId;
        const currentTaskGroupId = this.props.location.query.taskGroupId;
        const nextTaskId = location.query.taskId;
        const nextTaskGroupId = location.query.taskGroupId;
        const isSameResource = `${currentTaskGroupId}${currentTaskId}` === `${nextTaskGroupId}${nextTaskId}`;
        const task = !currentTask || !isSameResource
            ? job.TaskGroups
                .find(taskGroup => taskGroup.ID === nextTaskGroupId)
                .Tasks.find(task => task.ID === nextTaskId)
            : currentTask

        dispatch({
            type: EDIT_TASK,
            payload: task
        });
    }

    change(json){
        const {dispatch} = this.props;
        dispatch({
            type: EDIT_TASK,
            payload: json
        });
    }

    run(){
        const {dispatch, job, currentTask, location} = this.props;
        const taskGroups = job.TaskGroups.map(
            (taskGroup) => taskGroup.ID === location.query.taskGroupId
                ? {
                    ...taskGroup,
                    Tasks: taskGroup.Tasks.map((task) => task.ID === currentTask.ID ? currentTask : task)
                }
                : taskGroup
        );
        dispatch({
            type: RUN_JOB,
            payload: JSON.stringify({
                ...job,
                TaskGroups: taskGroups
            })
        });
    }

    render(){
        const { job, location, currentTask } = this.props;
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
              <div className="col-md-6 tab-column">
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
              <div className="col-md-6 tab-column">
                <legend>Task: { (taskGroupId && taskId) ? `${taskGroupId}/${taskId}` : null}</legend>
                {currentTask && (
                    <div>
                        <div className="col-md-6 col-md-offset-6">
                            <button type="button" className="btn btn-danger pull-right" onClick={this.onRun}>
                                <span className="glyphicon glyphicon-play-circle" aria-hidden="true"></span>
                                <span>{' Run'}</span>
                            </button>
                        </div>
                        <div className="col-md-6">
                            <JsonEdit json={ currentTask } onChange={ this.onChange } />
                        </div>
                    </div>)
                }
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ job, task }) {
    return { job, currentTask: task };
}

JobTasks.propTypes = {
    job: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobTasks);
