import React, { Component } from "react"
import PropTypes from "prop-types"
import { Cell, Column, Table } from "fixed-data-table-2";
import JobLink from "../JobLink/JobLink"
import AllocationDistribution from "../AllocationDistribution/AllocationDistribution"
import JobHealth from "../JobHealth/JobHealth"

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
      {job.Type}
    </Cell>
  )
}

const JobPriorityCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      {job.Priority}
    </Cell>
  )
}

const JobStatusCell = ({ rowIndex, data: jobs, ... props }) => {
  const job = jobs[rowIndex];
  return (
    <Cell {...props}>
      {job.Status}
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

const fixedProps = {
  width: 50,
  maxWidth: 50,
  flexGrow: 1
}

const flexProps = {
  width: 300,
  minWidth: 300,
  flexGrow: 2
}


class JobList extends Component {
  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  componentWillMount = () => {
    this.updateDimensions()
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateDimensions)
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions)
  }

  render() {
    const width = this.state.width - 240;
    const height = Math.max(this.state.height - 165, 300)
    const jobs = this.props.jobs;
    return (
      <Table
        key="table"
        rowHeight={35}
        headerHeight={35}
        rowsCount={jobs.length}
        height={height}
        width={width}
        touchScrollEnabled
        >
          <Column header={<Cell>Name</Cell>} cell={<JobNameCell data={jobs} />} {...flexProps} />
          <Column header={<Cell>Type</Cell>} cell={<JobTypeCell data={jobs} />} {...fixedProps} />
          <Column header={<Cell>Priority</Cell>} cell={<JobPriorityCell data={jobs} />} {...fixedProps} />
          <Column header={<Cell>Status</Cell>} cell={<JobStatusCell data={jobs} />} {...fixedProps} />
          <Column header={<Cell>In Sync</Cell>} cell={<JobInSyncCell data={jobs} />} {...fixedProps} />
          <Column header={<Cell>Groups</Cell>} cell={<JobGroupsCell data={jobs} />} {...fixedProps} />
          <Column header={<Cell>Allocation Status</Cell>} cell={<JobAllocationStatusCell data={jobs} />} {...flexProps} />
          <Column header={<Cell># Lost</Cell>} cell={<JobGroupsCell data={jobs} />} {...fixedProps} />
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
