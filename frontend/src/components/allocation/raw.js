import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const AllocationRaw = ({ allocation }) =>
  <div className="tab-pane active">
    <Json json={ allocation } />
  </div>;

function mapStateToProps({ allocation }) {
    return { allocation };
}

AllocationRaw.propTypes = {
    allocation: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(AllocationRaw);
