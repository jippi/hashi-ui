import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../components/evaluation_list';

const Evaluations = ({ evaluations, nodes }) =>
  <div className="row">
    <div className="col-md-12">
      <div className="card">
        <div className="header">
          <h4 className="title">Evaluations</h4>
        </div>
        <div className="content table-responsive table-full-width">
          <EvaluationList evaluations={ evaluations } nodes={ nodes } />
        </div>
      </div>
    </div>
  </div>;

function mapStateToProps({ evaluations, nodes }) {
    return { evaluations, nodes };
}

Evaluations.defaultProps = {
    evaluations: {},
    nodes: {},
};

Evaluations.propTypes = {
    evaluations: PropTypes.isRequired,
    nodes: PropTypes.isRequired,
};

export default connect(mapStateToProps)(Evaluations);
