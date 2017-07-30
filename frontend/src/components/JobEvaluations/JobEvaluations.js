import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import EvaluationList from "../EvaluationList/EvaluationList"
import { WATCH_EVALS, UNWATCH_EVALS } from "../../sagas/event"

class JobEvaluations extends Component {
  componentWillMount() {
    this.props.dispatch({ type: WATCH_EVALS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_EVALS })
  }

  render() {
    const jobId = this.props.params.jobId
    const evals = this.props.evaluations.filter(evaluation => evaluation.JobID === jobId)

    return <EvaluationList evaluations={evals} nested />
  }
}

function mapStateToProps({ evaluations }) {
  return { evaluations }
}

JobEvaluations.defaultProps = {
  evaluations: [],
  params: {}
}

JobEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(JobEvaluations)
