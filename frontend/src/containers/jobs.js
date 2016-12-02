import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { DropdownButton } from 'react-bootstrap';
import NomadLink from '../components/NomadLink/NomadLink';

const jobStatusColors = {
  running: '',
  pending: 'warning',
  dead: 'danger',
};

const summaryLabels = ['Starting', 'Running', 'Queued', 'Complete', 'Failed', 'Lost'];

const getJobStatisticsHeader = () => {
  const output = [];

  summaryLabels.forEach((key) => {
    output.push(<th width="75" key={ `statistics-header-for-${key}` }>{ key }</th>);
  });

  return output;
};

const getJobStatisticsRow = (job) => {
  const counter = {
    Queued: 0,
    Complete: 0,
    Failed: 0,
    Running: 0,
    Starting: 0,
    Lost: 0,
  };

  if (job.JobSummary !== null) {
    const summary = job.JobSummary.Summary;
    Object.keys(summary).forEach((taskGroupID) => {
      counter.Queued += summary[taskGroupID].Queued;
      counter.Complete += summary[taskGroupID].Complete;
      counter.Failed += summary[taskGroupID].Failed;
      counter.Running += summary[taskGroupID].Running;
      counter.Starting += summary[taskGroupID].Starting;
      counter.Lost += summary[taskGroupID].Lost;
    });
  } else {
    Object.keys(counter).forEach(key => (counter[key] = 'N/A'));
  }

  const output = [];
  summaryLabels.forEach((key) => {
    output.push(<td key={ `${job.ID}-${key}` }>{counter[key]}</td>);
  });

  return output;
};

class Jobs extends Component {

  filteredJobs() {
    const query = this.props.location.query || {};
    let jobs = this.props.jobs;

    if ('job_type' in query) {
      jobs = jobs.filter(job => job.Type === query.job_type);
    }

    if ('job_status' in query) {
      jobs = jobs.filter(job => job.Status === query.job_status);
    }

    return jobs;
  }

  jobTypeFilter() {
    const location = this.props.location;
    const query = this.props.location.query || {};

    let title = 'Job Type';
    if ('job_type' in query) {
      title = <span>{title}: <code>{ query.job_type }</code></span>;
    }

    return (
      <DropdownButton title={ title } key="filter-job-type" id="filter-job-type">
        <li><Link to={ location.pathname } query={{ ...query, job_type: undefined }}>- Any -</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_type: 'system' }}>System</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_type: 'batch' }}>Batch</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_type: 'service' }}>Service</Link></li>
      </DropdownButton>
    );
  }

  jobStatusFilter() {
    const location = this.props.location;
    const query = this.props.location.query || {};

    let title = 'Job Status';
    if ('job_status' in query) {
      title = <span>{title}: <code>{ query.job_status }</code></span>;
    }

    return (
      <DropdownButton title={ title } key="filter-job-status" id="filter-job-status">
        <li><Link to={ location.pathname } query={{ ...query, job_status: undefined }}>- Any -</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_status: 'running' }}>Running</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_status: 'pending' }}>Pending</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, job_status: 'dead' }}>Dead</Link></li>
      </DropdownButton>
    );
  }

  taskGroupCount(job) {
    let taskGroupCount = 'N/A';

    if (job.JobSummary !== null) {
      taskGroupCount = Object.keys(job.JobSummary.Summary).length;
    }

    return taskGroupCount;
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="header">
              <h4 className="title">Jobs</h4>
              {this.jobStatusFilter()}
                  &nbsp;
              {this.jobTypeFilter()}
            </div>

            <div className="content table-responsive table-full-width">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th width="100">Status</th>
                    <th width="100">Type</th>
                    <th width="100">Priority</th>
                    <th width="100">Task Groups</th>
                    { getJobStatisticsHeader() }
                  </tr>
                </thead>
                <tbody>
                  { this.filteredJobs().map(job =>
                    <tr key={ job.ID } className={ jobStatusColors[job.Status] }>
                      <td><NomadLink jobId={ job.ID } short="true" /></td>
                      <td>{ job.Status }</td>
                      <td>{ job.Type }</td>
                      <td>{ job.Priority }</td>
                      <td>{ this.taskGroupCount(job) }</td>
                      { getJobStatisticsRow(job) }
                    </tr>
                      )}
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
  return { jobs };
}

Jobs.defaultProps = {
  jobs: [],
  location: {},
};

Jobs.propTypes = {
  jobs: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Jobs);
