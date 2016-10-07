import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../components/evaluation/list';

const Evaluations = ({ evaluations }) =>
  <div className="row">
    <div className="col-md-12">
      <div className="card">
        <div className="header">
          <h4 className="title">Evaluations</h4>
        </div>
        <div className="content table-responsive table-full-width">
          <EvaluationList evaluations={ evaluations } />
        </div>
      </div>
    </div>
  </div>;

function mapStateToProps({ evaluations }) {
    return { evaluations };
}

Evaluations.defaultProps = {
    evaluations: {},
};

Evaluations.propTypes = {
    evaluations: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Evaluations);
