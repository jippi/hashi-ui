import React, { PropTypes } from 'react';
import Boolean from './boolean';

const NodeStatus = ({ value }) => {
    switch (value) {
    case 'initializing':
        return (<span>initializing</span>);

    case 'ready':
        return (<Boolean value title={ value } />);

    case 'down':
        return (<Boolean title={ value } />);

    default:
        return (<span>{value}</span>);
    }
};

NodeStatus.defaultProps = {
    value: null,
};

NodeStatus.propTypes = {
    value: PropTypes.isRequired,
};

export default NodeStatus;
