import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import FontIcon from "material-ui/FontIcon"
import { Column, Cell } from "fixed-data-table-2"
import { NOMAD_UNWATCH_JOB_HEALTH, NOMAD_WATCH_JOB_HEALTH } from "../../sagas/event"
import { green, red, grey } from '@material-ui/core/colors';
const green500 = green['500'];
const red500 = red['500'];
const grey200 = grey['200'];

const JobHealthCell = ({ rowIndex, dispatch, jobHealth, data, ...props }) => (
  <Cell rowIndex={rowIndex} data={data} {...props}>
    <JobHealth dispatch={dispatch} job={data[rowIndex]} health={jobHealth} />
  </Cell>
)
export { JobHealthCell }

class JobHealth extends PureComponent {
  componentDidMount() {
    this.watch(this.props.jobID);
  }

  componentWillUnmount() {
    this.unwatch(this.props.jobID);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.jobID !== this.props.jobID) {
      this.unwatch(prevProps.jobID);
      this.watch(this.props.jobID);
    }
  }

  unwatch = jobID => {
    this.props.dispatch({
      type: NOMAD_UNWATCH_JOB_HEALTH,
      payload: {
        id: jobID
      }
    })
  }

  watch = jobID => {
    this.props.dispatch({
      type: NOMAD_WATCH_JOB_HEALTH,
      payload: {
        id: jobID
      }
    })
  }

  render() {
    const health = this.props.health

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

function mapStateToProps({ jobHealth }, { jobID }) {
  return { health: jobHealth[jobID] }
}

JobHealth.propTypes = {
  dispatch: PropTypes.func.isRequired,
  health: PropTypes.object,
  jobID: PropTypes.string.isRequired,
}

export default connect(mapStateToProps)(JobHealth)
