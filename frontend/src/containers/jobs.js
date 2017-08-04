import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardHeader, CardText } from "material-ui/Card"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../components/Table"
import JobStatusFilter from "../components/JobStatusFilter/JobStatusFilter"
import JobTypeFilter from "../components/JobTypeFilter/JobTypeFilter"
import JobLink from "../components/JobLink/JobLink"
import AllocationDistribution from "../components/AllocationDistribution/AllocationDistribution"
import { WATCH_JOBS, UNWATCH_JOBS } from "../sagas/event"
import { Grid, Row, Col } from "react-flexbox-grid"

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

const getJobStatisticsHeader = () => {
  return (
    <TableHeaderColumn style={flexibleWidth} key={`statistics-header`}>
      Allocation Status
    </TableHeaderColumn>
  )
}

const getJobStatisticsRow = job => {
  return (
    <TableRowColumn style={flexibleWidth} key={`${job.ID}-statistics`}>
      <AllocationDistribution job={job} />
    </TableRowColumn>
  )
}

class Jobs extends Component {
  componentDidMount() {
    this.props.dispatch({ type: WATCH_JOBS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_JOBS })
  }

  filteredJobs() {
    const query = this.props.location.query || {}
    let jobs = this.props.jobs

    if ("job_type" in query) {
      jobs = jobs.filter(job => job.Type === query.job_type)
    }

    if ("job_status" in query) {
      jobs = jobs.filter(job => job.Status === query.job_status)
    }

    return jobs
  }

  taskGroupCount(job) {
    let taskGroupCount = "N/A"

    if (job.JobSummary !== null) {
      taskGroupCount = Object.keys(job.JobSummary.Summary).length
    }

    return taskGroupCount
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
      <div>
        <Card>
          <CardText>
            <Grid fluid style={{ padding: 0, margin: 0 }}>
              <Row>
                <Col key="job-status-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <JobStatusFilter />
                </Col>
                <Col key="job-type-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <JobTypeFilter />
                </Col>
              </Row>
            </Grid>
          </CardText>
        </Card>

        <Card style={{ marginTop: "1rem" }}>
          <CardText>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn style={flexibleWidth}>Name</TableHeaderColumn>
                  <TableHeaderColumn style={columnFormat}>Type</TableHeaderColumn>
                  <TableHeaderColumn style={columnFormat}>Priority</TableHeaderColumn>
                  <TableHeaderColumn style={columnFormat}>Status</TableHeaderColumn>
                  <TableHeaderColumn style={columnFormat}>Groups</TableHeaderColumn>
                  {getJobStatisticsHeader()}
                  <TableHeaderColumn style={columnFormat}># Lost</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {this.filteredJobs().map(job => {
                  return (
                    <TableRow key={job.ID}>
                      <TableRowColumn style={flexibleWidth}>
                        <JobLink jobId={job.Name} />
                      </TableRowColumn>
                      <TableRowColumn style={columnFormat}>
                        {job.Type}
                      </TableRowColumn>
                      <TableRowColumn style={columnFormat}>
                        {job.Priority}
                      </TableRowColumn>
                      <TableRowColumn style={columnFormat}>
                        {job.Status}
                      </TableRowColumn>
                      <TableRowColumn style={columnFormat}>
                        {this.taskGroupCount(job)}
                      </TableRowColumn>
                      {getJobStatisticsRow(job)}
                      <TableRowColumn style={columnFormat}>
                        {this.failedTaskCount(job)}
                      </TableRowColumn>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

function mapStateToProps({ jobs }) {
  return { jobs }
}

Jobs.defaultProps = {
  jobs: [],
  location: {}
}

Jobs.propTypes = {
  jobs: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Jobs)
