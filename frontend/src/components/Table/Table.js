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

    bodyStyle: {
      tableLayout: 'auto',
      overflowX: 'inherit',
      overflowY: 'inherit'
    }
  }

}

export default Table
