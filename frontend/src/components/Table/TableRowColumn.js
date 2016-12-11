import React, { Component } from 'react'
import { TableRowColumn as MaterialTableRowColumn } from 'material-ui/Table'
import deepmerge from 'deepmerge'

class TableRowColumn extends Component {

  render () {
    const overrideProps = {
      style: {
        height: 30,
        paddingLeft: 0
      }
    }

    const props = deepmerge(this.props, overrideProps)

    return (<MaterialTableRowColumn { ...props } />)
  }

}

export default TableRowColumn
