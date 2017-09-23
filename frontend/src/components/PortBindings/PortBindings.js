import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../Table"
import { withRouter } from "react-router"

class PortBinding extends PureComponent {
  render () {
    return (
      <TableRow key={this.props.key}>
        <TableRowColumn>{this.props.network.Device}</TableRowColumn>
        <TableRowColumn>{this.props.network.IP}</TableRowColumn>
        <TableRowColumn>{this.props.label}</TableRowColumn>
        <TableRowColumn>{this.props.port}</TableRowColumn>
      </TableRow>
    )
  }
}

class PortBindings extends PureComponent {
  render() {
    const networks = this.props.networks

    let network_items = []
    networks.map((network) =>
      network.DynamicPorts.map((portMap, index) =>
        network_items.push(<PortBinding key={portMap.Label} network={network} label={portMap.Label} port={portMap.Value}/>)
      )
    )

    return (
      <Table selectable={false} showCheckboxes={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{ width: 80 }}>Interface</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 80 }}>IP</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 80 }}>Label</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 80 }}>Port</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody preScanRows={false} displayRowCheckbox={false} showRowHover>
          {network_items}
        </TableBody>
      </Table>
    )
  }
}

PortBindings.defaultProps = {
  networks: [],
}

PortBindings.propTypes = {
  networks: PropTypes.array.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(PortBindings)
