import React, { Component } from "react"
import PropTypes from "prop-types"
import { TableHeaderColumn as MaterialTableHeaderColumn } from "material-ui/Table"

class TableHeaderColumn extends Component {
  static propTypes = {
    style: PropTypes.object
  }

  render() {
    const overrideStyle = {
      paddingLeft: 0,
      height: 30
    }

    const newStyle = Object.assign({}, this.props.style, overrideStyle)
    const newProps = Object.assign({}, this.props)
    newProps.style = newStyle

    return <MaterialTableHeaderColumn {...newProps} />
  }
}

export default TableHeaderColumn
