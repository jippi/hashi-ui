import React, { Component } from "react"
import PropTypes from "prop-types"
import JobList from "../JobList/JobList"
import { NOMAD_WATCH_JOBS_FILTERED, NOMAD_UNWATCH_JOBS_FILTERED } from "../../sagas/event"
import { connect } from "react-redux"
import { Card, CardHeader, CardText } from "material-ui/Card"

class JobChildren extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: NOMAD_WATCH_JOBS_FILTERED,
      payload: {
        prefix: this.props.job.ID + "/"
      }
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_JOBS_FILTERED,
      payload: {
        prefix: this.props.job.ID + "/"
      }
    })
  }

  render() {
    return (
      <Card>
        <CardText>
          <JobList jobs={this.props.filteredJobs} />
        </CardText>
      </Card>
    )
  }
}

function mapStateToProps({ job, filteredJobs }) {
  return { job, filteredJobs }
}

JobChildren.defaultProps = {
  filteredJobs: []
}

JobChildren.propTypes = {
  job: PropTypes.object.isRequired,
  filteredJobs: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(JobChildren)
