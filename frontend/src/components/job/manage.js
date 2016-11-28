import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NomadLink from '../link';
import Table from '../table';
import { RUN_JOB } from '../../sagas/event';
import MetaDisplay from '../meta';

class JobManage extends Component {
    constructor(props) {
        super(props);
        this.onRun = () => this.run();
        this.onImage = (taskId, taskGroupId) => this.image(taskId, taskGroupId);
        this.onPause = taskGroupId => this.pause(taskGroupId);
        this.onCount = taskGroupId => this.count(taskGroupId);
        this.location = this.props.location;
        this.job = this.props.job;
    }

    run() {
        this.props.dispatch({
            type: RUN_JOB,
            payload: JSON.stringify(this.job),
        });
    }

    image(taskId, taskGroupId) {
        return (event) => {
            if (this.job === null) {
                this.job = this.props.job;
            }
            this.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)
            .map(taskGroup => taskGroup.Tasks
                .filter(task => task.ID === taskId))[0][0].Config.image = event.target.value;
        };
    }

    pause(taskGroupId) {
        return () => {
            if (this.job === null) {
                this.job = this.props.job;
            }
            this.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)[0].Count = 0;
            this.run();
        };
    }

    count(taskGroupId) {
        return (event) => {
            if (this.job === null) {
                this.job = this.props.job;
            }
            this.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)[0].Count = parseInt(event.target.value, 10);
        };
    }

    render() {
        const taskGroupHeaders = [
            'ID',
            'Name',
            'Count',
            'Meta',
            'Restart Policy',
            '',
        ];
        const taskHeaders = [
            'ID',
            'Name',
            'Driver',
            'Config',
        ];
        const tasks = [];
        const taskGroups = [];
        const inputStyle = {
            display: 'inline',
            width: 'inherit',
        };
        const updateStyle = {
            float: 'right',
            'margin-right': '7px',
        };

        this.props.job.TaskGroups.forEach((taskGroup) => {
            let max = 10000;
            if (this.props.job.Type === 'system') {
                max = 1;
            }
            taskGroups.push(
              <tr key={ taskGroup.ID }>
                <td><NomadLink taskGroupId={ taskGroup.ID } jobId={ this.props.job.ID } short="true" /></td>
                <td>{ taskGroup.Name }</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={ max }
                    style={ inputStyle }
                    className="form-control"
                    defaultValue={ taskGroup.Count }
                    onChange={ this.onCount(taskGroup.ID) }
                  />
                </td>
                <td><MetaDisplay metaBag={ taskGroup.Meta } asTooltip /></td>
                <td>{ taskGroup.RestartPolicy.Mode }</td>
                <td>
                  { (taskGroup.Count !== 0) ?
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={ updateStyle }
                      onClick={ this.onPause(taskGroup.ID) }
                    >
                        Pause
                    </button>
                    : null
                  }
                </td>
              </tr>
            );
        });

        this.props.job.TaskGroups.forEach((taskGroup) => {
            const disabled = taskGroup.Count === 0;
            taskGroup.Tasks.forEach((task) => {
                tasks.push(
                  <tr key={ task.ID }>
                    <td>
                      <NomadLink
                        taskId={ task.ID }
                        taskGroupId={ taskGroup.ID }
                        jobId={ this.props.job.ID }
                        short="true"
                      />
                    </td>
                    <td>{ task.Name }</td>
                    <td>{ task.Driver }</td>
                    { (task.Driver === 'docker') ? (
                      <td>
                        Image: <input
                          type="text"
                          name="name"
                          style={ inputStyle }
                          className="form-control"
                          defaultValue={ task.Config.image }
                          onChange={ this.onImage(task.ID, taskGroup.ID) }
                          disabled={ disabled }
                        /></td>)
                        : <td></td>
                      }
                  </tr>
                );
            });
        });
        return (
          <div className="nested-content">
            <div className="table-responsive">
              <legend>Task Groups</legend>
              <button
                type="button"
                className="btn btn-success"
                style={ updateStyle }
                onClick={ this.onRun }
              >
                Update
              </button>
              { (taskGroups.length > 0) ?
                <Table
                  classes="table table-hover table-striped"
                  headers={ taskGroupHeaders }
                  body={ taskGroups }
                />
            : null
            }
            </div>
            <div className="table-responsive">
              <legend>Tasks</legend>
              <button
                type="button"
                className="btn btn-success"
                style={ updateStyle }
                onClick={ this.onRun }
              >
                Update
              </button>
              { (tasks.length > 0) ?
                <Table
                  classes="table table-hover table-striped"
                  headers={ taskHeaders }
                  body={ tasks }
                />
                : null
              }
            </div>
          </div>
        );
    }
}

function mapStateToProps({ job, location }) {
    return { job, location };
}

JobManage.defaultProps = {
    job: {},
    location: {},
};

JobManage.propTypes = {
    job: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(JobManage);
