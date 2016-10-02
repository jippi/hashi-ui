import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const MemberRaw = ({ member }) =>
  <div className="tab-pane active">
    <Json json={ member } />
  </div>;

function mapStateToProps({ member }) {
    return { member };
}

MemberRaw.propTypes = {
    member: PropTypes.isRequired,
};

export default connect(mapStateToProps)(MemberRaw);
