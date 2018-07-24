import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { withRouter } from "react-router"
import { Card, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../components/Table"
import { NOMAD_WATCH_NODES, NOMAD_UNWATCH_NODES } from "../sagas/event"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import ClientLink from "../components/ClientLink/ClientLink"
import FormatBoolean from "../components/FormatBoolean/FormatBoolean"
import NodeStatus from "../components/NodeStatus/NodeStatus"
import FilterFreetext from "../components/FilterFreetext/FilterFreetext"

class Clients extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  filteredClients() {
    let clients = this.props.nodes
    const query = this.props.location.query || {}

    if ("client_id" in query) {
      clients = clients.filter(client => client.ID.indexOf(query.client_id) != -1)
    }

    if ("client_name" in query) {
      clients = clients.filter(client => client.Name.indexOf(query.client_name) != -1)
    }

    if ("class_name" in query) {
      clients = clients.filter(client => client.NodeClass.indexOf(query.class_name) != -1)
    }

    if ("status" in query) {
      clients = clients.filter(client => client.Status.indexOf(query.status) != -1)
    }

    if ("drain" in query) {
      clients = clients.filter(client => (client.Drain ? "true" : "false") == query.drain)
    }

    if ("eligibility" in query) {
      clients = clients.filter(client => (client.SchedulingEligibility == "eligible" ? "true" : "false") == query.eligibility)
    }

    return clients
  }

  idFilter() {
    return (
      <Col key="client-id-filter-pane" xs={12} sm={6} md={6} lg={2}>
        <FilterFreetext query="client_id" label="ID" />
      </Col>
    )
  }

  nameFilter() {
    return (
      <Col key="client-name-filter-pane" xs={12} sm={6} md={6} lg={2}>
        <FilterFreetext query="client_name" label="Name" />
      </Col>
    )
  }

  classFilter() {
    return (
      <Col key="client-class-filter-pane" xs={12} sm={6} md={6} lg={2}>
        <FilterFreetext query="class_name" label="Class" />
      </Col>
    )
  }

  statusFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}
    const title = "Status"
    const handleChange = (event, index, value) => {
      this.props.router.push({
        pathname: location.pathname,
        query: { ...query, status: value }
      })
    }

    return (
      <Col key="client-status-filter-pane" xs={12} sm={6} md={6} lg={2}>
        <SelectField
          floatingLabelText={title}
          maxHeight={200}
          value={query.status || undefined}
          onChange={handleChange}
        >
          <MenuItem />
          <MenuItem value="ready" primaryText="Ready" />
          <MenuItem value="down" primaryText="Down" />
        </SelectField>
      </Col>
    )
  }

  drainFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}
    const title = "Drain"
    const handleChange = (event, index, value) => {
      this.props.router.push({
        pathname: location.pathname,
        query: { ...query, drain: value }
      })
    }

    return (
      <Col key="client-drain-filter-pane" xs={12} sm={6} md={6} lg={2}>
        <SelectField
          floatingLabelText={title}
          maxHeight={200}
          value={query.drain || undefined}
          onChange={handleChange}
        >
          <MenuItem />
          <MenuItem value="true" primaryText="On" />
          <MenuItem value="false" primaryText="Off" />
        </SelectField>
      </Col>
    )
  }

  eligibilityFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}
    const title = "Eligibility"
    const handleChange = (event, index, value) => {
      this.props.router.push({ pathname: location.pathname, query: { ...query, eligibility: value } })
    }

    return <Col key="client-eligibility-filter-pane" xs={12} sm={6} md={6} lg={2}>
      <SelectField floatingLabelText={title} maxHeight={200} value={query.eligibility || undefined} onChange={handleChange}>
          <MenuItem />
          <MenuItem value="true" primaryText="On" />
          <MenuItem value="false" primaryText="Off" />
        </SelectField>
      </Col>
  }

  render() {
    return <div>
        <Helmet>
          <title>Clients - Nomad - Hashi-UI</title>
        </Helmet>

        <Card key="filter">
          <CardText>
            <Grid fluid style={{ padding: 0, margin: 0 }}>
              <Row>
                {this.idFilter()}
                {this.nameFilter()}
                {this.statusFilter()}
                {this.drainFilter()}
                {this.eligibilityFilter()}
                {this.classFilter()}
              </Row>
            </Grid>
          </CardText>
        </Card>

        <Card key="list" style={{ marginTop: "1rem" }}>
          <CardText>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>ID</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Status</TableHeaderColumn>
                  <TableHeaderColumn>Drain</TableHeaderColumn>
                  <TableHeaderColumn>Eligibility</TableHeaderColumn>
                  <TableHeaderColumn>Datacenter</TableHeaderColumn>
                  <TableHeaderColumn>Class</TableHeaderColumn>
                  <TableHeaderColumn>Version</TableHeaderColumn>
                  <TableHeaderColumn>CPU</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {this.filteredClients().map(node => {
                  return <TableRow key={node.ID}>
                      <TableRowColumn>
                        <ClientLink clientId={node.ID} clients={this.props.nodes} />
                      </TableRowColumn>
                      <TableRowColumn>{node.Name}</TableRowColumn>
                      <TableRowColumn>
                        <NodeStatus value={node.Status} />
                      </TableRowColumn>
                      <TableRowColumn>
                        <FormatBoolean value={node.Drain} />
                      </TableRowColumn>
                      <TableRowColumn>
                        <FormatBoolean value={node.SchedulingEligibility == "eligible"} />
                      </TableRowColumn>
                      <TableRowColumn>{node.Datacenter}</TableRowColumn>
                      <TableRowColumn>{node.NodeClass ? node.NodeClass : "<none>"}</TableRowColumn>
                      <TableRowColumn>{node.Version}</TableRowColumn>
                      <TableRowColumn>{node.Stats.cpu}%</TableRowColumn>
                    </TableRow>
                })}
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
  }
}

function mapStateToProps({ nodes }) {
  return { nodes }
}

Clients.propTypes = {
  nodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(withRouter(Clients))
