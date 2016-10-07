import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation/list';

class JobEvals extends PureComponent {

    render() {
        const jobId = this.props.params.jobId;
        const evals = this.props.evaluations.filter(evaluation =>
            evaluation.JobID === jobId
        );

        return (
          <div className="tab-pane active">
            <EvaluationList evaluations={ evals } />
          </div>
        );
    }
}

function mapStateToProps({ evaluations }) {
    return { evaluations };
}

JobEvals.defaultProps = {
    evaluations: [],
    params: {},
};

JobEvals.propTypes = {
    evaluations: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobEvals);
