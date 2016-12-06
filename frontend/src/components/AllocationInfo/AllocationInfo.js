import React, { Component, PropTypes } from 'react'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { connect } from 'react-redux'
import JobLink from '../JobLink/JobLink'
import ClientLink from '../ClientLink/ClientLink'
import MetaPayload from '../MetaPayload/MetaPayload'
import FormatTime from '../FormatTime/FormatTime'

const allocProps = [
  'ID',
  'Name',
  'ClientStatus',
  'ClientDescription',
  'DesiredStatus',
  'DesiredDescription'
]

class AllocationInfo extends Component {

  static taskState (allocation, name, states) {
    const title = (
      <h3>
        Task state history for {allocation.JobID}.{allocation.TaskGroup}.{name} (final state: {states.State})
      </h3>
    )

    let lastEventTime = null

    return (
      <Card>
        <CardTitle title={ title } />
        <CardText>
          <Table selectable={ false } showCheckboxes={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn style={{ width: 180 }}>When</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 180 }}>Duration</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 180 }}>Type</TableHeaderColumn>
                <TableHeaderColumn>Message / Reason</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 180 }}>Signal</TableHeaderColumn>
                <TableHeaderColumn style={{ width: 50 }}>Code</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody preScanRows={ false } displayRowCheckbox={ false } showRowHover>
              { states.Events.map((element, index) => {
                if (!lastEventTime) {
                  lastEventTime = element.Time
                }

                const output = (
                  <TableRow key={ index }>
                    <TableRowColumn style={{ width: 180 }}>
                      <FormatTime time={ element.Time } />
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 180 }}>
                      <FormatTime
                        time={ element.Time }
                        now={ lastEventTime }
                        identifier={ allocation.ID }
                        durationInterval='ms'
                        durationFormat='h [hour] m [min] s [seconds]'
                      />
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 180 }}>
                      { element.Type }
                    </TableRowColumn>
                    <TableRowColumn>
                      {
                        element.Message
                        || element.SetupError
                        || element.DriverError
                        || element.KillError
                        || element.DownloadError
                        || element.ValidationError
                        || element.VaultError
                        || element.RestartReason
                        || element.KillReason
                        || element.TaskSignalReason
                      }
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 180 }}>
                      { element.Signal || element.TaskSignal }
                    </TableRowColumn>
                    <TableRowColumn style={{ width: 50 }}>
                      { element.ExitCode }
                    </TableRowColumn>
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

  render () {
    const allocation = this.props.allocation
    const jobId = allocation.JobID
    const nodeId = allocation.NodeID
    const taskGroupId = allocation.TaskGroupId

    const allocValues = {}
    allocProps.map((allocProp) => {
      allocValues[allocProp] = allocation[allocProp] ? allocation[allocProp] : '-'
      return null
    })

    // don't render anything big until we got the allocation from the API
    if (!jobId) {
      return <div>Loading ...</div>
    }

    allocValues.Job = <JobLink jobId={ jobId } nodeList={ this.props.nodes } />

    allocValues.TaskGroup = (
      <JobLink jobId={ jobId } taskGroupId={ taskGroupId } >
        {allocation.TaskGroup}
      </JobLink>
    )

    allocValues.Node = <ClientLink clientId={ nodeId } clients={ this.props.nodes } />

    const states = []
    Object.keys(allocation.TaskStates || {}).forEach((key) => {
      states.push(<br />)
      states.push(AllocationInfo.taskState(allocation, key, allocation.TaskStates[key]))
    })

    return (
      <div style={{ padding: 0 }}>
        <Card>
          <CardTitle title='Allocation Properties' />
          <CardText>
            <MetaPayload metaBag={ allocValues } sortKeys={ false } />
          </CardText>
        </Card>

        { states }
      </div>
    )
  }
}

function mapStateToProps ({ allocation, nodes }) {
  return { allocation, nodes }
}

AllocationInfo.propTypes = {
  allocation: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(AllocationInfo)
