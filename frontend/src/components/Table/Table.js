import React, { PropTypes } from 'react';

const Table = ({ classes, headers, body }) =>
  <div className="content table-responsive table-full-width">
    <table className={ classes }>
      <thead>
        <tr>
          { headers.map(header => <th key={ header }>{ header }</th>) }
        </tr>
      </thead>
      <tbody>
        { body }
      </tbody>
    </table>
  </div>;

Table.propTypes = {
  classes: PropTypes.string.isRequired,
  headers: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired,
};

export default Table;
