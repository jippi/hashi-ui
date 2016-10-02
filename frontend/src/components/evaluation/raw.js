import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const EvalRaw = ({ evaluation }) =>
  <div className="tab-pane active">
    <Json json={ evaluation } />
  </div>;

function mapStateToProps({ evaluation }) {
    return { evaluation };
}

EvalRaw.propTypes = {
    evaluation: PropTypes.isRequired,
};

export default connect(mapStateToProps)(EvalRaw);
