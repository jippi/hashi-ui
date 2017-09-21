import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { Card, CardText } from "material-ui/Card"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../components/Table"
import { NOMAD_WATCH_NODES, NOMAD_UNWATCH_NODES } from "../sagas/event"
import ClientLink from "../components/ClientLink/ClientLink"
import FormatBoolean from "../components/FormatBoolean/FormatBoolean"
import NodeStatus from "../components/NodeStatus/NodeStatus"

class Clients extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Clients - Nomad - Hashi-UI</title>
        </Helmet>

        <Card>
          <CardText>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>ID</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Status</TableHeaderColumn>
                  <TableHeaderColumn>Drain</TableHeaderColumn>
                  <TableHeaderColumn>Datacenter</TableHeaderColumn>
                  <TableHeaderColumn>Class</TableHeaderColumn>
                  <TableHeaderColumn>CPU</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {this.props.nodes.map(node => {
                  return (
                    <TableRow key={node.ID}>
                      <TableRowColumn>
                        <ClientLink clientId={node.ID} />
                      </TableRowColumn>
                      <TableRowColumn>{node.Name}</TableRowColumn>
                      <TableRowColumn>
                        <NodeStatus value={node.Status} />
                      </TableRowColumn>
                      <TableRowColumn>
                        <FormatBoolean value={node.Drain} />
                      </TableRowColumn>
                      <TableRowColumn>{node.Datacenter}</TableRowColumn>
                      <TableRowColumn>{node.NodeClass ? node.NodeClass : "<none>"}</TableRowColumn>
                      <TableRowColumn>{node.Stats.cpu}%</TableRowColumn>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

function mapStateToProps({ nodes }) {
  return { nodes }
}

Clients.propTypes = {
  nodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Clients)
