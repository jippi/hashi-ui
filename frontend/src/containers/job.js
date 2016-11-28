import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs';

import { WATCH_JOB, UNWATCH_JOB } from '../sagas/event';

class Job extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info',
                },
                {
                    name: 'Allocations',
                    path: 'allocations',
                },
                {
                    name: 'Evaluations',
                    path: 'evaluations',
                },
                {
                    name: 'Tasks Groups',
                    path: 'taskGroups',
                },
                {
                    name: 'Tasks',
                    path: 'tasks',
                },
                {
                    name: 'Manage',
                    path: 'manage',
                },
                {
                    name: 'Raw',
                    path: 'raw',
                },
            ],
        };
    }

    componentWillMount() {
        this.props.dispatch({
            type: WATCH_JOB,
            payload: this.props.params.jobId,
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_JOB,
            payload: this.props.params.jobId,
        });
    }

    render() {
        if (this.props.job == null) return (null);

        const path = this.props.location.pathname;
        const tabSlug = path.split('/').pop();
        const basePath = path.substring(0, path.lastIndexOf('/'));

        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Job: { this.props.job.ID }</h4>
                </div>
                <div className="tab-content">
                  <Tabs tabs={ this.state.tabs } tabSlug={ tabSlug } basePath={ basePath }>
                    { this.props.children }
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ job }) {
    return { job };
}

Job.propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Job);
