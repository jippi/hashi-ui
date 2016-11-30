import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import NomadLink from '../link';
import Table from '../table';
import { RUN_JOB } from '../../sagas/event';
import MetaDisplay from '../meta';

class JobManage extends Component {
    constructor(props) {
        super(props);
        this.onRun = () => this.run();
        this.onEdit = () => this.edit();
        this.onImage = (taskId, taskGroupId) => this.image(taskId, taskGroupId);
        this.onPause = taskGroupId => this.pause(taskGroupId);
        this.onCount = taskGroupId => this.count(taskGroupId);
        this.state = {
            job: _.cloneDeep(props.job),
            edit: false,
        };
    }

    componentWillReceiveProps(props) {
        if (!this.state.edit) {
            this.setState({ job: _.cloneDeep(props.job) });
        }
    }

    edit() {
        this.setState({
            job: _.cloneDeep(this.props.job),
            edit: !this.state.edit,
        });
    }

    run() {
        this.props.dispatch({
            type: RUN_JOB,
            payload: JSON.stringify(this.state.job),
        });
    }

    image(taskId, taskGroupId) {
        return (event) => {
            this.state.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)
            .map(taskGroup => taskGroup.Tasks
                .filter(task => task.ID === taskId))[0][0].Config.image = event.target.value;
            this.setState(this.state);
        };
    }

    pause(taskGroupId) {
        return () => {
            this.state.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)[0].Count = 0;
            this.setState(this.state);
            this.run();
        };
    }

    count(taskGroupId) {
        return (event) => {
            this.state.job.TaskGroups
            .filter(taskGroup => taskGroup.ID === taskGroupId)[0].Count = parseInt(event.target.value, 10);
            this.setState(this.state);
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
            marginRight: '7px',
        };

        this.state.job.TaskGroups.map((taskGroup, gdix) => {
            let max = 10000;
            if (this.state.job.Type === 'system') {
                max = 1;
            }
            taskGroups.push(
              <tr key={ taskGroup.ID }>
                <td><NomadLink taskGroupId={ taskGroup.ID } jobId={ this.state.job.ID } short="true" /></td>
                <td>{ taskGroup.Name }</td>
                <td>
                  { (this.state.edit) ?
                    <input
                      type="number"
                      min="0"
                      max={ max }
                      style={ inputStyle }
                      className="form-control"
                      value={ taskGroup.Count }
                      onChange={ this.onCount(taskGroup.ID) }
                    />
                    : taskGroup.Count
                  }
                </td>
                <td><MetaDisplay metaBag={ taskGroup.Meta } asTooltip /></td>
                <td>{ taskGroup.RestartPolicy.Mode }</td>
                <td>
                  { (this.state.edit && this.props.job.TaskGroups[gdix].Count !== 0) ?
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
            return null;
        });

        this.state.job.TaskGroups.forEach((taskGroup) => {
            const disabled = taskGroup.Count === 0;
            taskGroup.Tasks.forEach((task) => {
                tasks.push(
                  <tr key={ task.ID }>
                    <td>
                      <NomadLink
                        taskId={ task.ID }
                        taskGroupId={ taskGroup.ID }
                        jobId={ this.state.job.ID }
                        short="true"
                      />
                    </td>
                    <td>{ task.Name }</td>
                    <td>{ task.Driver }</td>
                    { (this.state.edit && task.Driver === 'docker') ? (
                      <td>
                        Image: <input
                          type="text"
                          name="name"
                          style={ inputStyle }
                          className="form-control"
                          value={ task.Config.image }
                          onChange={ this.onImage(task.ID, taskGroup.ID) }
                          disabled={ disabled }
                        /></td>)
                        : <td>Image: { task.Config.image }</td>
                      }
                  </tr>
                );
            });
        });
        return (
          <div className="nested-content">
            { (this.state.edit && !this.props.readonly) ?
              <button
                type="button"
                className="btn btn-danger"
                style={ updateStyle }
                onClick={ this.onEdit }
              >
                Close
              </button>
              : null
            }
            { (!this.state.edit && !this.props.readonly) ?
              <button
                type="button"
                className="btn btn-success"
                style={ updateStyle }
                onClick={ this.onEdit }
              >
                Edit
              </button>
              : null
            }
            <div className="table-responsive">
              <legend>Task Groups</legend>
              { (this.state.edit) ?
                <button
                  type="button"
                  className="btn btn-success"
                  style={ updateStyle }
                  onClick={ this.onRun }
                >
                    Update
                </button>
                : null
              }
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
              { (this.state.edit) ?
                <button
                  type="button"
                  className="btn btn-success"
                  style={ updateStyle }
                  onClick={ this.onRun }
                >
                    Update
                </button>
                : null
              }
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

function mapStateToProps({ job, readonly }) {
    return { job, readonly };
}

JobManage.defaultProps = {
    readonly: true,
    job: {
        TaskGroups: [],
    },
};

JobManage.propTypes = {
    readonly: PropTypes.bool.isRequired,
    job: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(JobManage);
