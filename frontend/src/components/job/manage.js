import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NomadLink from '../link';
import Table from '../table';
import { RUN_JOB } from '../../sagas/event';

class JobManage extends Component {
    constructor(props) {
        super(props);
        this.onRun = () => this.run();
        this.onChange = (taskId, taskGroupId) => this.change(taskId, taskGroupId);
        this.location = this.props.location;
        this.job = null;
    }

    run() {
        this.props.dispatch({
            type: RUN_JOB,
            payload: JSON.stringify(this.props.job),
        });
    }

    change(taskId, taskGroupId) {
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

    render() {
        console.log(this.props.job);
        const taskHeaders = [
            'ID',
            'Name',
            'Driver',
            'Config',
        ];

        const tasks = [];
        this.props.job.TaskGroups.forEach((taskGroup) => {
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
                          className="form-control"
                          defaultValue={ task.Config.image }
                          onChange={ this.onChange(task.ID, taskGroup.ID) }
                        /></td>)
                        : <td></td>
                      }
                  </tr>
                );
            });
        });
        const updateStyle = {
            float: 'right',
        };
        return (
          <div className="nested-content">
            <div className="table-responsive">
              <legend>Tasks</legend>
              <button
                type="button"
                className="btn btn-success"
                style={ updateStyle } onClick={ this.onRun }
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
