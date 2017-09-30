import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import FontIcon from "material-ui/FontIcon"
import { Column, Cell } from "fixed-data-table-2"
import { NOMAD_UNWATCH_JOB_HEALTH, NOMAD_WATCH_JOB_HEALTH } from "../../sagas/event"
import { green500, red500, grey200 } from "material-ui/styles/colors"

const JobHealthCell = ({ rowIndex, dispatch, jobHealth, data, ...props }) => (
  <Cell rowIndex={rowIndex} data={data} {...props}>
    <JobHealth dispatch={dispatch} job={data[rowIndex]} health={jobHealth} />
  </Cell>
)
export { JobHealthCell }

class JobHealth extends Component {
  componentDidMount() {
    if (this.props.job.Type != "service" || this.props.job.Status != "running") {
      return
    }

    this.props.dispatch({
      type: NOMAD_WATCH_JOB_HEALTH,
      payload: {
        id: this.props.job.ID
      }
    })
  }

  componentWillUnmount() {
    if (this.props.job.Type != "service" || this.props.job.Status != "running") {
      return
    }

    this.props.dispatch({
      type: NOMAD_UNWATCH_JOB_HEALTH,
      payload: {
        id: this.props.job.ID
      }
    })
  }

  render() {
    const jobID = this.props.job.ID
    const health = this.props.jobHealth[jobID]

    if (this.props.job.Type != "service" || this.props.job.Status != "running") {
      return null
    }

    if (!health) {
      return (
        <FontIcon color={grey200} className="material-icons">
          help_outline
        </FontIcon>
      )
    }

    let icon = ""

    if (health.Missing == 0) {
      icon = (
        <FontIcon color={green500} className="material-icons">
          {health.Total > 1 ? "done_all" : "done"}
        </FontIcon>
      )
    }

    if (health.Missing != 0) {
      icon = (
        <FontIcon color={red500} className="material-icons">
          clear
        </FontIcon>
      )
    }

    return <span>{icon}</span>
  }
}

function mapStateToProps({ jobHealth }) {
  return { jobHealth }
}

JobHealth.propTypes = {
  dispatch: PropTypes.func.isRequired,
  job: PropTypes.object.isRequired,
  jobHealth: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobHealth)
