import React, { PropTypes } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';

const TableHelper = ({ classes, headers, body }) =>
  <Table selectable={ false } showCheckboxes={ false } className={ classes }>
    <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
      <TableRow>
        { headers.map(header => <TableHeaderColumn key={ header }>{ header }</TableHeaderColumn>) }
      </TableRow>
    </TableHeader>
    <TableBody preScanRows={ false } showRowHover>
      { body }
    </TableBody>
  </Table>;

TableHelper.propTypes = {
  classes: PropTypes.string.isRequired,
  headers: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired,
};

export default TableHelper;
