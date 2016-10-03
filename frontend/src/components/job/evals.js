import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation/list';

const JobEvals = ({ evaluations, nodes, job }) => {
    const evals = evaluations.filter(evaluation =>
        evaluation.JobID === job.ID
    );

    return (
      <div className="tab-pane active">
        <EvaluationList evaluations={ evals } nodes={ nodes } />
      </div>
    );
};

function mapStateToProps({ evaluations, job, nodes }) {
    return { evaluations, job, nodes };
}

JobEvals.defaultProps = {
    evaluations: [],
    nodes: [],
};

JobEvals.propTypes = {
    evaluations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    job: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobEvals);
