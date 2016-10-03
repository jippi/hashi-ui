import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge } from 'react-bootstrap';

const metricColor = {
    Running: 'text-success',
    Complete: 'text-success',
    Starting: 'text-warning',
    Queued: 'text-warning',
    Failed: 'text-danger',
    Lost: 'text-danger',
};

const clientStatus = {
    Running: 0,
    Starting: 0,
};

const Statistics = ({ jobs }) => {
    Object.values(jobs).forEach((job) => {
        Object.keys(job.JobSummary.Summary).forEach((taskGroup) => {
            Object.keys(job.JobSummary.Summary[taskGroup]).forEach((stat) => {
                if (!(stat in clientStatus)) {
                    clientStatus[stat] = 0;
                }

                clientStatus[stat] += job.JobSummary.Summary[taskGroup][stat];
            });
        });
    });

    const batches = [];
    Object.keys(clientStatus).forEach((key) => {
        let bsStyle;
        if (key in metricColor) {
            bsStyle = metricColor[key];
        }

        batches.push(
          <div key={ key } className={ `col-xs-4 col-md-2 ${bsStyle}` }>
            {key}
            <Badge>{clientStatus[key]}</Badge>
          </div>
        );
    });

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="content center table-responsive statistics-big">
              <div className="row">{batches}
              </div>
            </div>
          </div>
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
