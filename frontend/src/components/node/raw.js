import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const NodeRaw = ({ node }) =>
  <div className="tab-pane active">
    <Json json={ node } />
  </div>;

function mapStateToProps({ node }) {
    return { node };
}

NodeRaw.propTypes = {
    node: PropTypes.isRequired,
};

export default connect(mapStateToProps)(NodeRaw);
