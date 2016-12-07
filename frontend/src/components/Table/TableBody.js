import { TableBody as MaterialTableBody } from 'material-ui/Table'

class TableBody extends MaterialTableBody {

  static defaultProps = {
    showRowHover: true,
    preScanRows: false,
    displayRowCheckbox: false
  }

}

export default TableBody
