import React, { PropTypes } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';

const TableHelper = ({ classes, headers, body }) =>
  <Table className={ classes }>
    <TableHeader>
      <TableRow>
        { headers.map(header => <TableHeaderColumn key={ header }>{ header }</TableHeaderColumn>) }
      </TableRow>
    </TableHeader>
    <TableBody>
      { body }
    </TableBody>
  </Table>;

TableHelper.propTypes = {
  classes: PropTypes.string.isRequired,
  headers: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired,
};

export default TableHelper;
