import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Table, TableHeader, TableRow, TableHeaderColumn, TableBody, TableRowColumn } from '../Table'
import JobLink from '../JobLink/JobLink'
import RawJson from '../RawJson/RawJson'
import JobTaskGroupActionScale from '../JobTaskGroupActionScale/JobTaskGroupActionScale'
import JobTaskGroupActionStop from '../JobTaskGroupActionStop/JobTaskGroupActionStop'
import JobTaskGroupActionRestart from '../JobTaskGroupActionRestart/JobTaskGroupActionRestart'
import ConstraintTable from '../ConstraintTable/ConstraintTable'

const JobTaskGroups = ({ job, location }) => {
  const taskGroups = []
  const tasks = {}

  job.TaskGroups.forEach((taskGroup) => {
    taskGroups.push(
      <TableRow key={ taskGroup.ID }>
        <TableRowColumn>
          <JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID }>{ taskGroup.Name }</JobLink>
        </TableRowColumn>
        <TableRowColumn style={{ textAlign: 'right' }}>{ taskGroup.Count }</TableRowColumn>
        <TableRowColumn>
          <JobTaskGroupActionScale job={ job } taskGroup={ taskGroup } />
          <JobTaskGroupActionRestart job={ job } taskGroup={ taskGroup } />
          <JobTaskGroupActionStop job={ job } taskGroup={ taskGroup } />
        </TableRowColumn>
      </TableRow>
    )

    taskGroup.Tasks.map((task) => {
      tasks[taskGroup.ID] = tasks[taskGroup.ID] || []
      tasks[taskGroup.ID].push(
        <TableRow key={ task.ID }>
          <TableRowColumn>
            <JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID } taskId={ task.ID } >
              { task.Name }
            </JobLink>
          </TableRowColumn>
          <TableRowColumn>{ task.Driver }</TableRowColumn>
          <TableRowColumn>{ task.Resources.CPU }</TableRowColumn>
          <TableRowColumn>{ task.Resources.MemoryMB }</TableRowColumn>
          <TableRowColumn>{ task.Resources.DiskMB }</TableRowColumn>
          <TableRowColumn>
            <ConstraintTable idPrefix={ task.ID } asTooltip constraints={ task.Constraints } />
          </TableRowColumn>
        </TableRow>
      )
    })
  })

  let query = location.query || {};
  let taskGroupId = query.taskGroupId

  // Auto-select first task group if only one is available.
  if (!taskGroupId && job.TaskGroups.length > 0) {
    taskGroupId = job.TaskGroups[0].ID
  }

  return (
    <Grid fluid style={{ padding: 0 }}>
      <Row>
        <Col key='task-groups-pane' xs={ 12 } sm={ 12 } md={ 4 } lg={ 3 }>
          <Card>
            <CardTitle title='Task Groups' />
            <CardText>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn key='name'>Name</TableHeaderColumn>
                    <TableHeaderColumn key='count' style={{ width: 40, textAlign: 'right' }}>Count</TableHeaderColumn>
                    <TableHeaderColumn key='actions' style={{ width: 50 }}>Actions</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { taskGroups }
                </TableBody>
              </Table>
            </CardText>
          </Card>
        </Col>
        <Col key='data-pane' xs={ 12 } sm={ 12 } md={ 8 } lg={ 9 }>
          <Card>
            <CardTitle title={ `Tasks in "${taskGroupId}"` } />
            <CardText>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn key='name'>Name</TableHeaderColumn>
                    <TableHeaderColumn key='driver' style={{ width: 80 }}>Driver</TableHeaderColumn>
                    <TableHeaderColumn key='cpu' style={{ width: 80 }}>CPU</TableHeaderColumn>
                    <TableHeaderColumn key='memory' style={{ width: 80 }}>Memory</TableHeaderColumn>
                    <TableHeaderColumn key='disk' style={{ width: 80 }}>Disk</TableHeaderColumn>
                    <TableHeaderColumn key='constraints' style={{ width: 80 }}>Constraints</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { tasks[taskGroupId] }
                </TableBody>
              </Table>
            </CardText>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <CardTitle title={ `Raw JSON for "${taskGroupId}"` } />
            <CardText>
              { job.TaskGroups
                  .filter(taskGroup => taskGroup.ID === taskGroupId)
                  .map(taskGroup => <RawJson json={ taskGroup } />)
                  .pop()
              }
            </CardText>
          </Card>
        </Col>
      </Row>
    </Grid>)
}

function mapStateToProps ({ job }) {
  return { job }
}

JobTaskGroups.propTypes = {
  job: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobTaskGroups)
