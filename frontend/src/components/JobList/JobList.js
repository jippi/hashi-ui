import React, { Component } from "react"
import PropTypes from "prop-types"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../Table"
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

const summaryLabels = ["Starting", "Running", "Queued", "Complete", "Failed", "Lost"]

class JobList extends Component {
  taskGroupCount(job) {
    if (job.JobSummary !== null) {
      return Object.keys(job.JobSummary.Summary).length
    }

    return "N/A"
  }

  failedTaskCount(job) {
    let counter = 0

    if (job.JobSummary !== null) {
      const summary = job.JobSummary.Summary
      Object.keys(job.JobSummary.Summary).forEach(taskGroupID => {
        counter += summary[taskGroupID].Lost
      })
    }

    return counter
  }

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
                <TableRowColumn style={columnFormat}>{this.taskGroupCount(job)}</TableRowColumn>
                <TableRowColumn style={flexibleWidth} key={`${job.ID}-statistics`}>
                  <AllocationDistribution jobID={job.ID} summary={job.JobSummary.Summary} />
                </TableRowColumn>
                <TableRowColumn style={columnFormat}>{this.failedTaskCount(job)}</TableRowColumn>
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
