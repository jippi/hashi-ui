import React, { Component } from 'react'
import { TableRowColumn as MaterialTableRowColumn } from 'material-ui/Table'

class TableRowColumn extends Component {

  render () {
    const overrideProps = {
      style: {
        height: 30,
        paddingLeft: 0
      }
    }

    return (<MaterialTableRowColumn { ...this.props } { ...overrideProps } />)
  }

}

export default TableRowColumn
