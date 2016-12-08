import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { TableRow, TableRowColumn } from '../Table'
import JobLink from '../JobLink/JobLink'
import TableHelper from '../TableHelper/TableHelper'
import RawJson from '../RawJson/RawJson'
import MetaPayload from '../MetaPayload/MetaPayload'

const taskGroupHeaders = [
  'ID',
  'Name',
  'Count',
  'Meta',
  'Restart Policy'
]

const JobTaskGroups = ({ job, location }) => {
  const taskGroups = []

  job.TaskGroups.forEach((taskGroup) => {
    taskGroups.push(
      <TableRow key={ taskGroup.ID }>
        <TableRowColumn><JobLink taskGroupId={ taskGroup.ID } jobId={ job.ID } /></TableRowColumn>
        <TableRowColumn>{ taskGroup.Name }</TableRowColumn>
        <TableRowColumn>{ taskGroup.Count }</TableRowColumn>
        <TableRowColumn><MetaPayload metaBag={ taskGroup.Meta } asTooltip /></TableRowColumn>
        <TableRowColumn>{ taskGroup.RestartPolicy.Mode }</TableRowColumn>
      </TableRow>
    )
  })

  let taskGroupId = location.query.taskGroupId

    // Auto-select first task group if only one is available.
  if (!taskGroupId && job.TaskGroups.length === 1) {
    taskGroupId = job.TaskGroups[0].ID
  }

  return (
    <Grid fluid style={{ padding: 0 }}>
      <Row>
        <Col key='task-groups-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 5 }>
          <Card>
            <CardTitle title='Task Groups' />
            <CardText>
              { (taskGroups.length > 0)
                ? <TableHelper headers={ taskGroupHeaders } body={ taskGroups } />
                : null
              }
            </CardText>
          </Card>
        </Col>
        <Col key='data-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 7 }>
          <Card>
            <CardTitle title={ taskGroupId } />
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
