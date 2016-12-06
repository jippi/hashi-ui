import Paper from 'material-ui/Paper'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import JobLink from '../JobLink/JobLink'
import TableHelper from '../TableHelper/TableHelper'
import MetaPayload from '../MetaPayload/MetaPayload'
import ConstraintTable from '../ConstraintTable/ConstraintTable'

const jobProps = ['ID', 'Name', 'Region', 'Datacenters', 'Status', 'Priority']

class JobInfo extends Component {

  render () {
    const tasks = []
    const job = this.props.job
    const jobMetaBag = job.Meta || {}

    // Build the task groups table
    const taskGroups = job.TaskGroups.map((taskGroup) => {
      taskGroup.Tasks.map((task) => {
        tasks.push(
          <tr key={ task.ID }>
            <td>
              <JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID } >
                { taskGroup.Name }
              </JobLink>
            </td>
            <td>
              <JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID } taskId={ task.ID } >
                { task.Name }
              </JobLink>
            </td>
            <td>{ task.Driver }</td>
            <td>{ task.Resources.CPU }</td>
            <td>{ task.Resources.MemoryMB }</td>
            <td>{ task.Resources.DiskMB }</td>
            <td><ConstraintTable idPrefix={ task.ID } asTooltip constraints={ task.Constraints } /></td>
          </tr>
                )
        return null
      })

      const taskGroupMeta = taskGroup.Meta || {}
      return (
        <tr key={ taskGroup.ID }>
          <td>
            <JobLink jobId={ job.ID } taskGroupId={ taskGroup.ID } >
              { taskGroup.Name }
            </JobLink>
          </td>
          <td>{ taskGroup.Count }</td>
          <td>{ taskGroup.Tasks.length }</td>
          <td><MetaPayload asTooltip metaBag={ taskGroupMeta } /></td>
          <td>{ taskGroup.RestartPolicy.Mode }</td>
          <td><ConstraintTable idPrefix={ taskGroup.ID } asTooltip constraints={ taskGroup.Constraints } /></td>
        </tr>
      )
    })

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='properties-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
            <Card>
              <CardTitle title='Job Properties' />
              <CardText>
                <dl className='dl-horizontal'>
                  { jobProps.map((jobProp) => {
                    let jobPropValue = this.props.job[jobProp]
                    if (Array.isArray(jobPropValue)) {
                      jobPropValue = jobPropValue.join(', ')
                    }

                    const result = []
                    result.push(<dt>{ jobProp }</dt>)
                    result.push(<dd>{ jobPropValue }</dd>)

                    return result
                  }, this)}
                </dl>
              </CardText>
            </Card>
          </Col>
          <Col key='meta-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
            <Card>
              <CardTitle title='Meta Properties' />
              <CardText>
                <MetaPayload dtWithClass='wide' metaBag={ jobMetaBag } />
              </CardText>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 15 }}>
          <Col key='constraints-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
            <Card>
              <CardTitle title='Constraints' />
              <CardText>
                <ConstraintTable idPrefix={ this.props.job.ID } constraints={ this.props.job.Constraints } />
              </CardText>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 15 }}>
          <Col key='task-groups-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <Card>
              <CardTitle title='Task Groups' />
              <CardText>
                 { (taskGroups.length > 0) ?
                  <TableHelper
                    classes='table table-hover table-striped'
                    headers={ ['Name', 'Count', 'Tasks', 'Meta', 'Restart Policy', 'Constraints'] }
                    body={ taskGroups }
                  />
                  : null
                }
              </CardText>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 15 }}>
          <Col key='tasks-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <Card>
              <CardTitle title='Tasks' />
              <CardText>
                 { (tasks.length > 0) ?
                  <TableHelper
                    classes='table table-hover table-striped'
                    headers={ ['Task Group', 'Name', 'Driver', 'CPU', 'Memory', 'Disk', 'Constraints'] }
                    body={ tasks }
                  />
                  : null
                }
              </CardText>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}

JobInfo.defaultProps = {
  job: {
    constraints: []
  },
  allocations: {},
  evaluations: {}
}

function mapStateToProps ({ job, allocations, evaluations }) {
  return { job, allocations, evaluations }
}

JobInfo.propTypes = {
  job: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobInfo)
