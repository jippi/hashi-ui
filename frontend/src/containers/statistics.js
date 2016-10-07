import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Progressbar from '../components/charts/progressbar';

const Statistics = ({ jobs }) => {
    const clientStatus = {
        Running: 0,
        Starting: 0,
    };

    let hasJobSummary = true;
    Object.values(jobs).forEach((job) => {
        // Guard against releases < 0.4.1 which don't have job summaries
        if (job.JobSummary === null) {
            hasJobSummary = false;
            return;
        }

        Object.keys(job.JobSummary.Summary).forEach((taskGroup) => {
            Object.keys(job.JobSummary.Summary[taskGroup]).forEach((stat) => {
                if (!(stat in clientStatus)) {
                    clientStatus[stat] = 0;
                }

                clientStatus[stat] += job.JobSummary.Summary[taskGroup][stat];
            });
        });
    });

    if (!hasJobSummary) {
        return <div />;
    }

    delete clientStatus.Complete;

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <Progressbar title="Task Stats" data={ clientStatus } />
        </div>
      </div>
    );
};

function mapStateToProps({ jobs }) {
    return { jobs };
}

Statistics.propTypes = {
    jobs: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Statistics);
