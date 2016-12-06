import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import JobLink from '../components/JobLink/JobLink'

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
      <TableHeaderColumn
        style={ columnFormat }
        key={ `statistics-header-for-${key}` }
      >
        { key }
      </TableHeaderColumn>)
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
    output.push(<TableRowColumn style={ columnFormat } key={ `${job.ID}-${key}` }>{counter[key]}</TableRowColumn>)
  })

  return output
}

class Jobs extends Component {

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

  jobTypeFilter () {
    const location = this.props.location
    const query = this.props.location.query || {}

    let title = 'Job Type'
    if ('job_type' in query) {
      title = <span>{ title }: <code>{ query.job_type }</code></span>
    }

    return (
      <SelectField floatingLabelText={ title } maxHeight={ 200 }>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_type: undefined } }}>- Any -</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_type: 'system' } }}>System</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_type: 'batch' } }}>Batch</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_type: 'service' } }}>Service</Link>
        </MenuItem>
      </SelectField>
    )
  }

  jobStatusFilter () {
    const location = this.props.location
    const query = this.props.location.query || {}

    let title = 'Job Status'
    if ('job_status' in query) {
      title = <span>{ title }: <code>{ query.job_status }</code></span>
    }

    return (
      <SelectField floatingLabelText={ title } maxHeight={ 200 }>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_status: undefined } }}>- Any -</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_status: 'running' } }}>Running</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_status: 'pending' } }}>Pending</Link>
        </MenuItem>
        <MenuItem>
          <Link to={{ pathname: location.pathname, query: { ...query, job_status: 'dead' } }}>Dead</Link>
        </MenuItem>
      </SelectField>
    )
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
        <div style={{ padding: 10 }}>
          {this.jobStatusFilter()}
          &nbsp;
          {this.jobTypeFilter()}
        </div>

        <Table
          wrapperStyle={{ overflow: 'display' }}
          bodyStyle={{ tableLayout: 'auto', overflowX: 'inherit', overflowY: 'inherit' }}
        >
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false } enableSelectAll={ false }>
            <TableRow>
              <TableHeaderColumn style={ flexibleWidth }>ID</TableHeaderColumn>
              <TableHeaderColumn style={ columnFormat }>Status</TableHeaderColumn>
              <TableHeaderColumn style={ columnFormat }>Type</TableHeaderColumn>
              <TableHeaderColumn style={ columnFormat }>Priority</TableHeaderColumn>
              <TableHeaderColumn style={ columnFormat }>Task Groups</TableHeaderColumn>
              { getJobStatisticsHeader() }
            </TableRow>
          </TableHeader>
          <TableBody showRowHover preScanRows={ false } displayRowCheckbox={ false }>
            { this.filteredJobs().map((job) => {
              return (
                <TableRow key={ job.ID } hoverable selectable={ false }>
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
  location: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Jobs)
