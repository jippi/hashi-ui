import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation/list';

const ClientEvaluations = ({ evaluations, node, nodes }) => {
    const evals = evaluations.filter(evaluation =>
        evaluation.NodeID === node.ID
    );

    return (
      <div className="tab-pane active">
        <EvaluationList evaluations={ evals } nodes={ nodes } />
      </div>
    );
};

function mapStateToProps({ evaluations, node, nodes }) {
    return { evaluations, node, nodes };
}

ClientEvaluations.defaultProps = {
    evaluations: [],
    nodes: [],
    node: {},
};

ClientEvaluations.propTypes = {
    evaluations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientEvaluations);
