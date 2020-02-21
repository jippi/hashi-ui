import React, { Component } from "react"
import PropTypes from "prop-types"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../Table"
import { Cell } from "fixed-data-table-2";
import JobLink from "../JobLink/JobLink"
import AllocationDistribution from "../AllocationDistribution/AllocationDistribution"
import JobHealth from "../JobHealth/JobHealth"

const columnFormat = {
  width: 50,
  maxWidth: 50,
  overflow: "inherit",
  whiteSpace: "normal"
}
const flexibleWidth = {
  width: 300,
  minWidth: 300,
  overflow: "display",
  whiteSpace: "normal"
}

const taskGroupCount = job => {
    if (job.JobSummary !== null) {
      return Object.keys(job.JobSummary.Summary).length
    }

    return "N/A"
}

const failedTaskCount = job => {
  let counter = 0

  if (job.JobSummary !== null) {
    const summary = job.JobSummary.Summary
    Object.keys(job.JobSummary.Summary).forEach(taskGroupID => {
      counter += summary[taskGroupID].Lost
    })
  }

  return counter
}

const JobNameCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      <JobLink jobId={job.ID} />
    </Cell>
  )
}

const JobTypeCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      <JobLink jobId={job.Type} />
    </Cell>
  )
}

const JobPriorityCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      <JobLink jobId={job.Priority} />
    </Cell>
  )
}

const JobStatusCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      <JobLink jobId={job.Status} />
    </Cell>
  )
}

const JobInSyncCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      {job.Type == "service" ? <JobHealth jobID={job.ID} /> : null}
    </Cell>
  )
}

const JobGroupsCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      {taskGroupCount(job)}
    </Cell>
  )
}

const JobAllocationStatusCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      <AllocationDistribution jobID={job.ID} summary={job.JobSummary.Summary} />
    </Cell>
  )
}

const JobNumLostCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      {this.failedTaskCount(job)}
    </Cell>
  )
}


class JobList extends Component {
  render() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={flexibleWidth}>Name</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}>Type</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}>Priority</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}>Status</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}>In Sync</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}>Groups</TableHeaderColumn>
            <TableHeaderColumn style={flexibleWidth}>Allocation Status</TableHeaderColumn>
            <TableHeaderColumn style={columnFormat}># Lost</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.jobs.map(job => {
            return <TableRow key={job.ID}>
                <TableRowColumn style={flexibleWidth}>
                  <JobLink jobId={job.ID} />
                </TableRowColumn>
                <TableRowColumn style={columnFormat}>{job.Type}</TableRowColumn>
                <TableRowColumn style={columnFormat}>{job.Priority}</TableRowColumn>
                <TableRowColumn style={columnFormat}>{job.Status}</TableRowColumn>
                <TableRowColumn style={columnFormat}>
                  {job.Type == "service" ? <JobHealth jobID={job.ID} /> : null}
                </TableRowColumn>
                <TableRowColumn style={columnFormat}>{taskGroupCount(job)}</TableRowColumn>
                <TableRowColumn style={flexibleWidth} key={`${job.ID}-statistics`}>
                  <AllocationDistribution jobID={job.ID} summary={job.JobSummary.Summary} />
                </TableRowColumn>
                <TableRowColumn style={columnFormat}>{failedTaskCount(job)}</TableRowColumn>
              </TableRow>
          })}
        </TableBody>
      </Table>
    )
  }
}

JobList.defaultProps = {
  jobs: []
}

JobList.propTypes = {
  jobs: PropTypes.array.isRequired
}

export default JobList
