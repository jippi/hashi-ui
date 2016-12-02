import React, { PropTypes } from 'react';
import FormatBoolean from '../FormatBoolean/FormatBoolean';

const NodeStatus = ({ value }) => {
  switch (value) {
  case 'initializing':
    return (<span>initializing</span>);

  case 'ready':
    return (<FormatBoolean value title={ value } />);

  case 'down':
    return (<FormatBoolean value={ false } title={ value } />);

  default:
    return (<span>{value}</span>);
  }
};

NodeStatus.defaultProps = {
  value: null,
};

NodeStatus.propTypes = {
  value: PropTypes.string.isRequired,
};

export default NodeStatus;
