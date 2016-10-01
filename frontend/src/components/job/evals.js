import React, { Component } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation_list';

class JobEvals extends Component {

    render() {
        const evals = this.props.evaluations.filter((evaluation) => {
            return (evaluation.JobID === this.props.job.ID);
        })

        return (
            <div className="tab-pane active">
                <EvaluationList evaluations={evals} nodes={this.props.nodes} />
            </div>
        )
    }
}

function mapStateToProps({ evaluations, job, nodes }) {
    return { evaluations, job, nodes }
}

JobEvals.defaultProps = {
    evaluations: {},
    nodes: {},
};

export default connect(mapStateToProps)(JobEvals);
