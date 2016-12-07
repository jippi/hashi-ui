import React, { PropTypes } from 'react'
import { Table, TableHeader, TableRow, TableHeaderColumn, TableBody } from '../Table'

const TableHelper = ({ headers, body }) =>
  <Table>
    <TableHeader>
      <TableRow>
        { headers.map(header =>
          <TableHeaderColumn key={ header }>{ header }</TableHeaderColumn>)
        }
      </TableRow>
    </TableHeader>
    <TableBody>
      { body }
    </TableBody>
  </Table>

TableHelper.propTypes = {
  headers: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired
}

export default TableHelper
