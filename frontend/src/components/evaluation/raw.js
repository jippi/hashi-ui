import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const EvaluationRaw = ({ evaluation }) =>
  <div className="tab-pane active">
    <Json json={ evaluation } />
  </div>;

function mapStateToProps({ evaluation }) {
    return { evaluation };
}

EvaluationRaw.propTypes = {
    evaluation: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(EvaluationRaw);
