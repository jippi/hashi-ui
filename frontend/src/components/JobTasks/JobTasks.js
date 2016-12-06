import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import JobLink from '../JobLink/JobLink'
import TableHelper from '../TableHelper/TableHelper'
import RawJson from '../RawJson/RawJson'

const taskHeaders = [
  'ID',
  'Name',
  'Group',
  'Driver',
  'CPU',
  'Memory',
  'Disk'
]

const JobTasks = ({ job, location }) => {
  const tasks = []
  job.TaskGroups.forEach((taskGroup) => {
    taskGroup.Tasks.forEach((task) => {
      tasks.push(
        <tr key={ task.ID }>
          <td><JobLink jobId={ job.ID } taskId={ task.ID } taskGroupId={ taskGroup.ID } /></td>
          <td>{task.Name}</td>
          <td><JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID }>{ taskGroup.Name }</JobLink></td>
          <td>{ task.Driver }</td>
          <td>{ task.Resources.CPU }</td>
          <td>{ task.Resources.MemoryMB }</td>
          <td>{ task.Resources.DiskMB }</td>
        </tr>
      )
    })
  })

  let taskGroupId = location.query.taskGroupId
  let taskId = location.query.taskId

    // Auto-select first task if only one is available.
  if (!taskGroupId && !taskId && tasks.length === 1) {
    job.TaskGroups.forEach((taskGroup) => {
      taskGroup.Tasks.forEach((task) => {
        taskGroupId = taskGroup.ID
        taskId = task.ID
      })
    })
  }
  return (
    <div className='tab-pane active'>
      <div className='row'>
        <div className='col-md-6 tab-column'>
          <legend>Tasks</legend>
          { (tasks.length > 0) ?
            <TableHelper
              classes='table table-hover table-striped'
              headers={ taskHeaders }
              body={ tasks }
            />
              : null
            }
        </div>
        <div className='col-md-6 tab-column'>
          <legend>Task: { (taskGroupId && taskId) ? `${taskGroupId}/${taskId}` : null}</legend>
          { job.TaskGroups
                .filter(taskGroup => taskGroup.ID === taskGroupId)
                .map(taskGroup => taskGroup.Tasks
                    .filter(task => task.ID === taskId)
                    .map(task => <RawJson json={ task } />)
                    .pop())
                .pop()}
        </div>
      </div>
    </div>
  )
}

function mapStateToProps ({ job }) {
  return { job }
}

JobTasks.propTypes = {
  job: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobTasks)
