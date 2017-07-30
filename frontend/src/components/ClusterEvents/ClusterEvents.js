import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationLink from "../AllocationLink/AllocationLink"
import FormatTime from "../FormatTime/FormatTime"
import TableHelper from "../TableHelper/TableHelper"
import { TableRow, TableRowColumn } from "../Table"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { WATCH_ALLOCS, UNWATCH_ALLOCS } from "../../sagas/event"

class ClusterEvents extends Component {
  componentWillMount() {
    this.props.dispatch({ type: WATCH_ALLOCS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_ALLOCS })
  }

  render() {
    const taskEvents = []
    this.props.allocations.forEach(allocation => {
      if (allocation.TaskStates != null) {
        Object.keys(allocation.TaskStates).forEach(task => {
          allocation.TaskStates[task].Events.reverse().forEach(event => {
            if (taskEvents.length === 10) return
            const eventID = `${task}.${event.Time}`
            taskEvents.push(
              <TableRow key={eventID}>
                <TableRowColumn>
                  <AllocationLink allocationId={allocation.ID}>
                    {allocation.JobID}.{task}
                  </AllocationLink>
                </TableRowColumn>
                <TableRowColumn>
                  {event.Type}
                </TableRowColumn>
                <TableRowColumn>
                  {event.KillError ||
                    event.DriverError ||
                    event.DownloadError ||
                    event.RestartReason ||
                    event.Message ||
                    "<none>"}
                </TableRowColumn>
                <TableRowColumn>
                  <FormatTime identifier={eventID} time={event.Time} />
                </TableRowColumn>
              </TableRow>
            )
          })
        })
      }
    })

    return (
      <Card>
        <CardTitle title="Task events" />
        <CardText>
          <TableHelper headers={["Task", "Type", "Message", "Time"]} body={taskEvents} />
        </CardText>
      </Card>
    )
  }
}

function mapStateToProps({ allocations }) {
  return { allocations }
}

ClusterEvents.propTypes = {
  allocations: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ClusterEvents)
