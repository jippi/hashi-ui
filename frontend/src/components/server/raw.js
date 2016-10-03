import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const ServerRaw = ({ member }) =>
  <div className="tab-pane active">
    <Json json={ member } />
  </div>;

function mapStateToProps({ member }) {
    return { member };
}

ServerRaw.propTypes = {
    member: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ServerRaw);
