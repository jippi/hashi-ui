import React from 'react';
import { connect } from 'react-redux';

import JSON from '../json'

const ClientRaw = ({ node }) => {
    return (
        <div className="tab-pane active">
            <JSON json={node} />
        </div>
    )
}

function mapStateToProps({ node }) {
    return { node }
}

export default connect(mapStateToProps)(ClientRaw)
