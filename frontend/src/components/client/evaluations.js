import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation/list';

const ClientEvaluations = ({ evaluations, node }) => {
    const evals = evaluations.filter(evaluation =>
        evaluation.NodeID === node.ID
    );

    return (
      <div className="tab-pane active">
        <EvaluationList evaluations={ evals } />
      </div>
    );
};

function mapStateToProps({ evaluations, node }) {
    return { evaluations, node, nodes: [] };
}

ClientEvaluations.defaultProps = {
    evaluations: [],
    node: {},
};

ClientEvaluations.propTypes = {
    evaluations: PropTypes.array.isRequired,
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientEvaluations);
