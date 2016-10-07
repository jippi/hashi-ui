import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { DropdownButton } from 'react-bootstrap';
import { getJobStatisticsHeader, getJobStatisticsRow } from '../helpers/statistics';
import NomadLink from '../components/link';

const jobStatusColors = {
    running: '',
    pending: 'warning',
    dead: 'danger',
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
                        <th>Status</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Task Groups</th>
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
                          <td>{Object.keys(job.JobSummary.Summary).length}</td>
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
