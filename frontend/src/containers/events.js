import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import AllocationLink from '../components/AllocationLink/AllocationLink'
import FormatTime from '../components/FormatTime/FormatTime'

class Events extends Component {

  render () {
    const taskEvents = []
    this.props.allocations.forEach((allocation) => {
      if (allocation.TaskStates != null) {
        Object.keys(allocation.TaskStates).forEach((task) => {
          allocation.TaskStates[task].Events.reverse().forEach((event) => {
            if (taskEvents.length === 10) return
            const eventID = `${task}.${event.Time}`
            taskEvents.push(
              <tr key={ eventID }>
                <td>
                  <AllocationLink allocationId={ allocation.ID } >
                    { allocation.JobID }.{ task }
                  </AllocationLink>
                </td>
                <td>{ event.Type }</td>
                <td>{ event.KillError ||
                      event.DriverError ||
                      event.DownloadError ||
                      event.RestartReason ||
                      event.Message ||
                      '<none>'
                    }
                </td>
                <td><FormatTime time={ event.Time } /></td>
              </tr>
            )
          })
        })
      }
    })

    return (
      <div className='row'>
        <div className='col-md-12'>
          <div className='card'>
            <div className='header'>
              <h4 className='title'>Task Events</h4>
            </div>
            <div className='content table-responsive table-full-width'>
              <table className='table table-hover table-striped'>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  { taskEvents }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ allocations }) {
  return { allocations }
}

Events.propTypes = {
  allocations: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(Events)
