import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation_list';

const JobEvals = ({ evaluations, nodes }) => {
    const evals = evaluations.filter(evaluation =>
        evaluation.JobID === this.props.job.ID
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
    evaluations: {},
    nodes: {},
};

JobEvals.propTypes = {
    evaluations: PropTypes.isRequired,
    nodes: PropTypes.isRequired,
};

export default connect(mapStateToProps)(JobEvals);
