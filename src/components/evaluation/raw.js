import React from 'react';
import { connect } from 'react-redux';

import JSON from '../json'

const EvalRaw = ({ evaluation }) => {
    return (
        <div className="tab-pane active">
            <JSON json={evaluation} />
        </div>
    )
}

function mapStateToProps({ evaluation }) {
    return { evaluation }
}

export default connect(mapStateToProps)(EvalRaw)
