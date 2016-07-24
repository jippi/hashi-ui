import React, { Component } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs'

import { FETCH_JOB, STOP_WATCHING_JOB } from '../sagas/job';

class Job extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info'
                },
                {
                    name: 'Allocations',
                    path: 'allocations'
                },
                {
                    name: 'Evaluations',
                    path: 'evaluations'
                },
                {
                    name: 'Raw',
                    path: 'raw'
                }
            ]
        }
    }

    componentWillMount() {
        this.props.dispatch({
            type: FETCH_JOB,
            id: this.props.params['jobId']
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: STOP_WATCHING_JOB,
            id: this.props.params['jobId']
        });
    }

    render() {
        const path = this.props.location.pathname
        const tabSlug = path.split('/').pop()
        const basePath = path.substring(0, path.lastIndexOf("/"))

        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Job: {this.props.job.ID}</h4>
                        </div>
                        <div className="content">
                            <Tabs children={this.props.children} tabs={this.state.tabs} tabSlug={tabSlug} basePath={basePath} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ job, allocations }) {
    return { job, allocations }
}

export default connect(mapStateToProps)(Job)
