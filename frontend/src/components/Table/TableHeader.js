import { TableHeader as MaterialTableHeader } from 'material-ui/Table'

class TableHeader extends MaterialTableHeader {

  static defaultProps = {
    adjustForCheckbox: false,
    displaySelectAll: false,
    enableSelectAll: false,
    selectAllSelected: false,
  }

}

export default TableHeader
