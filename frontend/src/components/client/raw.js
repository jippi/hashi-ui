import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Json from '../json';

const ClientRaw = ({ node }) =>
  <div className="tab-pane active">
    <div className="content">
      <Json json={ node } />
    </div>
  </div>;

function mapStateToProps({ node }) {
    return { node };
}

ClientRaw.propTypes = {
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientRaw);
