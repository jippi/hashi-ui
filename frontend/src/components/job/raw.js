import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const JobRaw = ({ job }) =>
  <div className="tab-pane active">
    <Json json={ job } />
  </div>;

function mapStateToProps({ job }) {
    return { job };
}

JobRaw.propTypes = {
    job: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobRaw);
