import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getJobStatisticsHeader, getJobStatisticsRow } from '../helpers/statistics';
import NomadLink from '../components/link';

const jobStatusColors = {
    running: '',
    pending: 'warning',
    dead: 'danger',
};

const Jobs = ({ jobs }) =>
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
                { getJobStatisticsHeader() }
              </tr>
            </thead>
            <tbody>
              {jobs.map(job =>
                <tr key={ job.ID } className={ jobStatusColors[job.Status] }>
                  <td><NomadLink jobId={ job.ID } short="true" /></td>
                  <td>{job.Status}</td>
                  <td>{job.Type}</td>
                  <td>{job.Priority}</td>
                  <td>{Object.keys(job.JobSummary.Summary).length}</td>
                  { getJobStatisticsRow(job) }
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>;

function mapStateToProps({ jobs }) {
    return { jobs };
}

Jobs.propTypes = {
    jobs: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Jobs);
