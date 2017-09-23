import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../Table"
import { withRouter } from "react-router"

class PortBinding extends PureComponent {
  render() {
    return (
      <TableRow key={this.props.key}>
        <TableRowColumn>{this.props.label}</TableRowColumn>
        <TableRowColumn>{this.props.device}</TableRowColumn>
        <TableRowColumn>{this.props.ip}</TableRowColumn>
        <TableRowColumn>{this.props.port}</TableRowColumn>
      </TableRow>
    )
  }
}

class PortBindings extends PureComponent {
  render() {
    const networks = this.props.networks

    if (!networks) {
      return <div>The allocation does not have any port bindings</div>
    }

    let network_items = []
    networks.map(network => {
      if (network.DynamicPorts != null) {
        network.DynamicPorts.map((portMap, index) => {
          network_items.push(
            <PortBinding
              key={portMap.Label}
              device={network.Device}
              ip={network.IP}
              label={portMap.Label}
              port={portMap.Value}
            />
          )
        })
      }

      if (network.ReservedPorts != null) {
        const ip = this.props.client.Resources ? this.props.client.Resources.Networks[0].IP : undefined

        network.ReservedPorts.map((portMap, index) => {
          network_items.push(
            <PortBinding key={portMap.Label} device="host" ip={ip} label={portMap.Label} port={portMap.Value} />
          )
        })
      }
    })

    return (
      <Table selectable={false} showCheckboxes={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{ width: 80 }}>Label</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 80 }}>Interface</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 80 }}>IP</TableHeaderColumn>
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
  networks: []
}

PortBindings.propTypes = {
  networks: PropTypes.array,
  client: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(PortBindings)
