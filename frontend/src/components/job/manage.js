import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
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
        this.onEditModal = () => this.editModal();
        this.onRunModal = () => this.runModal();
        this.onOpenModal = () => this.openModal();
        this.onCloseModal = () => this.closeModal();
        this.onImage = (taskId, taskGroupId) => this.image(taskId, taskGroupId);
        this.onPause = taskGroupId => this.pause(taskGroupId);
        this.onCount = taskGroupId => this.count(taskGroupId);
        this.state = {
            job: _.cloneDeep(props.job),
            advancedjob: _.cloneDeep(props.job),
            edit: false,
            advancedMode: false,
        };
    }

    componentWillReceiveProps(props) {
        if (!this.state.edit) {
            this.setState({
                job: _.cloneDeep(props.job),
                advancedjob: _.cloneDeep(props.job),
            });
        }
    }

    edit() {
        this.setState({
            job: _.cloneDeep(this.props.job),
            edit: !this.state.edit,
        });
    }

    editModal() {
        return (event) => {
            this.setState({
                advancedjob: JSON.parse(event.target.value),
            });
        };
    }

    runModal() {
        this.props.dispatch({
            type: RUN_JOB,
            payload: JSON.stringify(this.state.advancedjob),
        });
    }

    openModal() {
        this.setState({
            advancedMode: true,
        });
    }

    closeModal() {
        this.setState({
            advancedMode: false,
            advancedjob: _.cloneDeep(this.props.job),
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
            width: '85%',
        };
        const updateStyle = {
            float: 'right',
            marginRight: '7px',
        };
        const tdWidthBtn = {
            width: '131px',
        };
        const tdWidthId = {
            width: '25%',
        };
        const tdWidthName = {
            width: '12%',
        };
        const tdWidthDriver = {
            width: '11%',
        };
        const customStyles = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '90%',
            },
        };

        this.state.job.TaskGroups.map((taskGroup, gdix) => {
            let max = 10000;
            if (this.state.job.Type === 'system') {
                max = 1;
            }
            taskGroups.push(
              <tr key={ taskGroup.ID }>
                <td style={ tdWidthId }>
                  <NomadLink
                    taskGroupId={ taskGroup.ID }
                    jobId={ this.state.job.ID }
                    short="true"
                  />
                </td>
                <td>{ taskGroup.Name }</td>
                <td>
                  { (this.state.edit) ?
                    <input
                      type="number"
                      min="0"
                      max={ max }
                      style={ inputStyle }
                      className="form-control input-sm"
                      value={ taskGroup.Count }
                      onChange={ this.onCount(taskGroup.ID) }
                    />
                    : taskGroup.Count
                  }
                </td>
                <td><MetaDisplay metaBag={ taskGroup.Meta } asTooltip /></td>
                <td>{ taskGroup.RestartPolicy.Mode }</td>
                <td style={ tdWidthBtn }>
                  { (this.state.edit && this.props.job.TaskGroups[gdix].Count !== 0) ?
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
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
                    <td style={ tdWidthId }>
                      <NomadLink
                        taskId={ task.ID }
                        taskGroupId={ taskGroup.ID }
                        jobId={ this.state.job.ID }
                        short="true"
                      />
                    </td>
                    <td style={ tdWidthName }>{ task.Name }</td>
                    <td style={ tdWidthDriver }>{ task.Driver }</td>
                    { (this.state.edit && task.Driver === 'docker') ? (
                      <td>
                        Image: <input
                          type="text"
                          name="name"
                          style={ inputStyle }
                          className="form-control input-sm"
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
            <div>
              <button
                type="button"
                className="btn btn-warning btn-sm"
                style={ updateStyle }
                onClick={ this.onOpenModal }
              >
                Advanced Edit
              </button>
              <Modal
                isOpen={ this.state.advancedMode }
                onRequestClose={ this.onCloseModal }
                style={ customStyles }
                contentLabel="Example Modal"
              >
                <div className="modal-header">
                  <button
                    onClick={ this.onCloseModal }
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h2 className="modal-title" id="myModalLabel">
                    Job: { this.state.advancedjob.Name }
                  </h2>
                </div>
                <div className="modal-body">
                  <textarea rows="30" cols="120" onChange={ this.onEditModal() }>
                    { JSON.stringify(this.state.advancedjob, null, 4) }
                  </textarea>
                </div>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  style={ updateStyle }
                  onClick={ this.onRunModal }
                >
                    Update
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={ updateStyle }
                  onClick={ this.onCloseModal }
                >
                    Close
                </button>
              </Modal>
            </div>
            { (this.state.edit && !this.props.readonly) ?
              <button
                type="button"
                className="btn btn-danger btn-sm"
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
                className="btn btn-success btn-sm"
                style={ updateStyle }
                onClick={ this.onEdit }
              >
                Edit
              </button>
              : null
            }
            <div className="table-responsive">
              <legend>
                Task Groups
              </legend>
              { (this.state.edit) ?
                <button
                  type="button"
                  className="btn btn-success btn-sm"
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
                  className="btn btn-success btn-sm"
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
