import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { Card, CardHeader, CardText } from "material-ui/Card"
import FilterFreetext from "../components/FilterFreetext/FilterFreetext"
import JobStatusFilter from "../components/JobStatusFilter/JobStatusFilter"
import JobTypeFilter from "../components/JobTypeFilter/JobTypeFilter"
import JobList from "../components/JobList/JobList"
import { NOMAD_WATCH_JOBS, NOMAD_UNWATCH_JOBS } from "../sagas/event"
import { Grid, Row, Col } from "react-flexbox-grid"

class Jobs extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_JOBS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_JOBS })
  }

  filteredJobs() {
    const query = this.props.location.query || {}
    let jobs = this.props.jobs

    if ("name" in query) {
      jobs = jobs.filter(job => job.Name.indexOf(query.name) != -1)
    }

    if ("job_type" in query) {
      jobs = jobs.filter(job => job.Type === query.job_type)
    }

    if ("job_status" in query) {
      jobs = jobs.filter(job => job.Status === query.job_status)
    }

    return jobs
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>Jobs - Nomad - Hashi-UI</title>
        </Helmet>
        <Card>
          <CardText>
            <Grid fluid style={{ padding: 0, margin: 0 }}>
              <Row>
                <Col key="job-name-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <FilterFreetext query="name" label="Name" />
                </Col>
                <Col key="job-type-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <JobTypeFilter />
                </Col>
                <Col key="job-status-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <JobStatusFilter />
                </Col>
              </Row>
            </Grid>
          </CardText>
        </Card>

        <Card style={{ marginTop: "1rem" }}>
          <CardText>
            <JobList jobs={this.filteredJobs()} />
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
