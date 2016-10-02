import React, { PropTypes } from 'react';

const Table = ({ classes, headers, body }) =>
  <table className={ classes }>
    <thead>
      <tr>
        { headers.map(header => <th key={ header }>{ header }</th>) }
      </tr>
    </thead>
    <tbody>
      { body }
    </tbody>
  </table>;

Table.propTypes = {
    classes: PropTypes.isRequired,
    headers: PropTypes.isRequired,
    body: PropTypes.isRequired,
};

export default Table;
