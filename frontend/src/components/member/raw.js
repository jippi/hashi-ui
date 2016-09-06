import React from 'react';
import { connect } from 'react-redux';

import JSON from '../json'

const MemberRaw = ({ member }) => {
    return (
        <div className="tab-pane active">
            <JSON json={member} />
        </div>
    )
}

function mapStateToProps({ member }) {
    return { member }
}

export default connect(mapStateToProps)(MemberRaw)
