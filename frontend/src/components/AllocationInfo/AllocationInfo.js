import React, { Component } from "react"
import PropTypes from "prop-types"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../Table"
import { Grid, Row, Col } from "react-flexbox-grid"
import { connect } from "react-redux"
import JobLink from "../JobLink/JobLink"
import ClientLink from "../ClientLink/ClientLink"
import PortBindings from "../PortBindings/PortBindings"
import MetaPayload from "../MetaPayload/MetaPayload"
import FormatTime from "../FormatTime/FormatTime"
import { NOMAD_FETCH_NODE } from "../../sagas/event"

const allocProps = ["ID", "Name", "ClientStatus", "ClientDescription", "DesiredStatus", "DesiredDescription"]

class AllocationInfo extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_FETCH_NODE, payload: this.props.allocation.NodeID })
  }

  static taskState(allocation, name, states) {
    const title = `Task state history for ${allocation.JobID}.${allocation.TaskGroup}.${name} (final state: ${states.State})`

    let lastEventTime = null

    return (
      <Card key={name}>
        <CardTitle title={title} />
        <CardText>
          <Table selectable={false} showCheckboxes={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn style={{ width: 180 }}>When</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 180 }}>Duration</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 180 }}>Type</TableHeaderColumn>
                <TableHeaderColumn>Message / Reason</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 75 }}>Signal</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 50 }}>Code</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody preScanRows={false} displayRowCheckbox={false} showRowHover>
              {states.Events.map((element, index) => {
                if (!lastEventTime) {
                  lastEventTime = element.Time
                }

                const output = (
                  <TableRow key={index}>
                    <TableRowColumn style={{ width: 180 }}>
                      <FormatTime time={element.Time} identifier={`${allocation.ID}-${element.Time}`} />
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 180 }}>
                      <FormatTime
                        time={element.Time}
                        now={lastEventTime}
                        identifier={`${allocation.ID}-${element.Time}`}
                        durationInterval="ms"
                        durationFormat="h [hour] m [min] s [seconds]"
                      />
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 180 }}>{element.Type}</TableRowColumn>
                    <TableRowColumn>
                      {element.DisplayMessage ||
                        element.Message ||
                        element.SetupError ||
                        element.DriverError ||
                        element.DriverMessage ||
                        element.FailedSibling ||
                        element.KillError ||
                        element.DownloadError ||
                        element.TaskSignal ||
                        element.ValidationError ||
                        element.VaultError ||
                        element.RestartReason ||
                        element.KillReason ||
                        element.TaskSignalReason}
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 75 }}>{element.Signal || element.TaskSignal}</TableRowColumn>
                    <TableRowColumn style={{ width: 50 }}>{element.ExitCode}</TableRowColumn>
                  </TableRow>
                )

                lastEventTime = element.Time
                return output
              })}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    )
  }

  render() {
    const allocation = this.props.allocation
    const jobId = allocation.JobID
    const nodeId = allocation.NodeID
    const taskGroupId = allocation.TaskGroupId

    const allocValues = {}
    allocProps.map(allocProp => {
      allocValues[allocProp] = allocation[allocProp] ? allocation[allocProp] : "-"
      return null
    })

    // don't render anything big until we got the allocation from the API
    if (!jobId) {
      return <div>Loading ...</div>
    }

    allocValues.Job = <JobLink jobId={jobId} />

    allocValues.TaskGroup = (
      <JobLink jobId={jobId} taskGroupId={taskGroupId}>
        {allocation.TaskGroup}
      </JobLink>
    )

    allocValues.Node = <ClientLink clientId={nodeId} client={this.props.node} />

    const states = []
    Object.keys(allocation.TaskStates || {}).forEach(key => {
      states.push(<br key={`br-${key}`} />)
      states.push(AllocationInfo.taskState(allocation, key, allocation.TaskStates[key]))
    })

    return (
      <Grid key={allocation.ID} fluid style={{ padding: 0 }}>
        <Row style={{ marginTop: "1rem" }}>
          <Col key="meta-pane" xs={12} sm={12} md={6} lg={6}>
            <Card>
              <CardTitle title="Allocation Properties" />
              <CardText>
                <MetaPayload metaBag={allocValues} sortKeys={false} identifier={allocation.ID} />
              </CardText>
            </Card>
          </Col>
          <Col key="port-pane" xs={12} sm={12} md={6} lg={6}>
            <Card key="PortBindings">
              <CardTitle title="Port Bindings" />
              <CardText>
                <PortBindings networks={this.props.allocation.Resources.Networks} client={this.props.node} />
              </CardText>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: "1rem" }}>
          <Col key="meta-pane" xs={12} sm={12} md={12} lg={12}>
            {states}
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps({ allocation, node }) {
  return { allocation, node }
}

AllocationInfo.propTypes = {
  dispatch: PropTypes.func.isRequired,
  allocation: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AllocationInfo)
