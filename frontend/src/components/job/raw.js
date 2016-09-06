import React from 'react';
import { connect } from 'react-redux';

import JSON from '../json'

const JobRaw = ({ job }) => {
    return (
        <div className="tab-pane active">
            <JSON json={job} />
        </div>
    )
}

function mapStateToProps({ job }) {
    return { job }
}

export default connect(mapStateToProps)(JobRaw)
