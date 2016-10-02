import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const AllocRaw = ({ allocation }) =>
  <div className="tab-pane active">
    <Json json={ allocation } />
  </div>;

function mapStateToProps({ allocation }) {
    return { allocation };
}

AllocRaw.propTypes = {
    allocation: PropTypes.isRequired,
};

export default connect(mapStateToProps)(AllocRaw);
