import React from 'react'
import { Table as MaterialTable } from 'material-ui/Table'

class Table extends MaterialTable {

  static defaultProps = {
    allRowsSelected: false,
    fixedFooter: false,
    fixedHeader: false,
    multiSelectable: false,
    selectable: false,

    height: 'inherit',

    wrapperStyle: {
      overflow: 'display'
    },

    style: {
      tableLayout: 'auto',
    },

    bodyStyle: {
      overflowX: 'inherit',
      overflowY: 'inherit'
    }
  }

  render() {
    return (
      <div className='nomad-table-responsive'>
        { Object.getPrototypeOf(Table.prototype).render.call(this) }
      </div>
    )
  }
}

export default Table
