import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../evaluation/list';

class ClientEvaluations extends PureComponent {

    render() {
        const nodeId = this.props.params.nodeId;
        const evals = this.props.evaluations.filter(evaluation => evaluation.NodeID === nodeId);

        return (
          <div className="tab-pane active">
            <EvaluationList evaluations={ evals } containerClassName="nested-content" />
          </div>
        );
    }
}

function mapStateToProps({ evaluations }) {
    return { evaluations };
}

ClientEvaluations.defaultProps = {
    evaluations: [],
    params: {},
};

ClientEvaluations.propTypes = {
    evaluations: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientEvaluations);
