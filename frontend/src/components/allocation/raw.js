import React from 'react';
import { connect } from 'react-redux';

import JSON from '../json'

const AllocRaw = ({ allocation }) => {
    return (
        <div className="tab-pane active">
            <JSON json={allocation} />
        </div>
    )
}

function mapStateToProps({ allocation }) {
    return { allocation }
}

export default connect(mapStateToProps)(AllocRaw)
