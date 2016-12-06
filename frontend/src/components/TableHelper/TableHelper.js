import React, { PropTypes } from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table'

const TableHelper = ({ classes, headers, body }) =>
  <Table
    wrapperStyle={{ overflow: 'display' }}
    bodyStyle={{ tableLayout: 'auto', overflowX: 'inherit', overflowY: 'inherit' }}
  >
    <TableHeader displaySelectAll={ false } adjustForCheckbox={ false } enableSelectAll={ false }>
      <TableRow>
        { headers.map(header => <TableHeaderColumn key={ header }>{ header }</TableHeaderColumn>) }
      </TableRow>
    </TableHeader>
    <TableBody showRowHover preScanRows={ false } displayRowCheckbox={ false }>
      { body }
    </TableBody>
  </Table>

TableHelper.propTypes = {
  classes: PropTypes.string.isRequired,
  headers: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired
}

export default TableHelper
