import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import RawJson from '../RawJson/RawJson';

const AllocationRaw = ({ allocation }) =>
  <div className="tab-pane active">
    <RawJson json={ allocation } />
  </div>;

function mapStateToProps({ allocation }) {
    return { allocation };
}

AllocationRaw.propTypes = {
    allocation: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(AllocationRaw);
