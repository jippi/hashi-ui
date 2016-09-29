import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link'

class Jobs extends Component {

    counterColumns() {
        return ['Queued', 'Complete', 'Failed', 'Running', 'Starting', 'Lost'];
    }

    getJobStatisticsHeader() {
        let output = [];
        this.counterColumns().forEach((key) => {
            output.push(<th key={'statistics-header-for-' + key} className="center">{key}</th>)
        });

        return output
    }

    getJobStatisticsRow(job) {
        let counter = {
            Queued: 0,
            Complete: 0,
            Failed: 0,
            Running: 0,
            Starting: 0,
            Lost: 0
        }

        let summary = job.JobSummary.Summary;
        Object.keys(summary).forEach(function(taskGroupID) {
            counter.Queued += summary[taskGroupID].Queued;
            counter.Complete += summary[taskGroupID].Complete;
            counter.Failed += summary[taskGroupID].Failed;
            counter.Running += summary[taskGroupID].Running;
            counter.Starting += summary[taskGroupID].Starting;
            counter.Lost += summary[taskGroupID].Lost;
        });

        let output = [];
        this.counterColumns().forEach((key) => {
            output.push(<td key={job.ID + '-' + key}>{counter[key]}</td>)
        });

        return output
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Jobs</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                        <th>Priority</th>
                                        <th>Task Groups</th>
                                        {this.getJobStatisticsHeader()}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.jobs.map((job) => {
                                        return (
                                            <tr key={job.ID}>
                                                <td><NomadLink jobId={job.ID} short="true"/></td>
                                                <td>{job.Status}</td>
                                                <td>{job.Type}</td>
                                                <td>{job.Priority}</td>
                                                <td>{Object.keys(job.JobSummary.Summary).length}</td>
                                                {this.getJobStatisticsRow(job)}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ jobs }) {
    return { jobs }
}

export default connect(mapStateToProps)(Jobs)
