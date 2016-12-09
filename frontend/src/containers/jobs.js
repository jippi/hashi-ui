import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from '../components/Table'
import JobStatusFilter from '../components/JobStatusFilter/JobStatusFilter'
import JobTypeFilter from '../components/JobTypeFilter/JobTypeFilter'
import JobLink from '../components/JobLink/JobLink'
import { WATCH_JOBS, UNWATCH_JOBS } from '../sagas/event'

const columnFormat = {
  width: 50,
  maxWidth: 50,
  overflow: 'inherit',
  whiteSpace: 'normal'
}

const summaryLabels = [
  'Starting',
  'Running',
  'Queued',
  'Complete',
  'Failed',
  'Lost'
]

const getJobStatisticsHeader = () => {
  const output = []

  summaryLabels.forEach((key) => {
    output.push(
      <TableHeaderColumn style={ columnFormat } key={ `statistics-header-for-${key}` }>
        { key }
      </TableHeaderColumn>
    )
  })

  return output
}

const getJobStatisticsRow = (job) => {
  const counter = {
    Queued: 0,
    Complete: 0,
    Failed: 0,
    Running: 0,
    Starting: 0,
    Lost: 0
  }

  if (job.JobSummary !== null) {
    const summary = job.JobSummary.Summary
    Object.keys(summary).forEach((taskGroupID) => {
      counter.Queued += summary[taskGroupID].Queued
      counter.Complete += summary[taskGroupID].Complete
      counter.Failed += summary[taskGroupID].Failed
      counter.Running += summary[taskGroupID].Running
      counter.Starting += summary[taskGroupID].Starting
      counter.Lost += summary[taskGroupID].Lost
    })
  } else {
    Object.keys(counter).forEach(key => (counter[key] = 'N/A'))
  }

  const output = []
  summaryLabels.forEach((key) => {
    output.push(
      <TableRowColumn style={ columnFormat } key={ `${job.ID}-${key}` }>
        {counter[key]}
      </TableRowColumn>
    )
  })

  return output
}

class Jobs extends Component {

  componentDidMount() {
    this.props.dispatch({type: WATCH_JOBS})
  }

  componentWillUnmount() {
    this.props.dispatch({type: UNWATCH_JOBS})
  }

  filteredJobs () {
    const query = this.props.location.query || {}
    let jobs = this.props.jobs

    if ('job_type' in query) {
      jobs = jobs.filter(job => job.Type === query.job_type)
    }

    if ('job_status' in query) {
      jobs = jobs.filter(job => job.Status === query.job_status)
    }

    return jobs
  }

  taskGroupCount (job) {
    let taskGroupCount = 'N/A'

    if (job.JobSummary !== null) {
      taskGroupCount = Object.keys(job.JobSummary.Summary).length
    }

    return taskGroupCount
  }

  render () {
    const flexibleWidth = { width: 300, minWidth: 300, overflow: 'display', whiteSpace: 'normal' }

    return (
      <div>
        <Card>
          <CardHeader title='Filter list' actAsExpander showExpandableButton />
          <CardText style={{ paddingTop: 0 }} expandable>
            <JobStatusFilter />
            &nbsp;
            <JobTypeFilter />
          </CardText>
        </Card>

        <Card style={{ marginTop: '1rem' }}>
          <CardText>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn style={ flexibleWidth }>ID</TableHeaderColumn>
                  <TableHeaderColumn style={ columnFormat }>Status</TableHeaderColumn>
                  <TableHeaderColumn style={ columnFormat }>Type</TableHeaderColumn>
                  <TableHeaderColumn style={ columnFormat }>Priority</TableHeaderColumn>
                  <TableHeaderColumn style={ columnFormat }>Task Groups</TableHeaderColumn>
                  { getJobStatisticsHeader() }
                </TableRow>
              </TableHeader>
              <TableBody>
                { this.filteredJobs().map((job) => {
                  return (
                    <TableRow key={ job.ID }>
                      <TableRowColumn style={ flexibleWidth }><JobLink jobId={ job.ID } /></TableRowColumn>
                      <TableRowColumn style={ columnFormat }>{ job.Status }</TableRowColumn>
                      <TableRowColumn style={ columnFormat }>{ job.Type }</TableRowColumn>
                      <TableRowColumn style={ columnFormat }>{ job.Priority }</TableRowColumn>
                      <TableRowColumn style={ columnFormat }>{ this.taskGroupCount(job) }</TableRowColumn>
                      { getJobStatisticsRow(job) }
                    </TableRow>
                  )
                })
              }
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

function mapStateToProps ({ jobs }) {
  return { jobs }
}

Jobs.defaultProps = {
  jobs: [],
  location: {}
}

Jobs.propTypes = {
  jobs: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Jobs)
