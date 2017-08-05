import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { NOMAD_WATCH_EVALS, NOMAD_UNWATCH_EVALS } from "../../sagas/event"
import EvaluationList from "../EvaluationList/EvaluationList"

class ClientEvaluations extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_EVALS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_EVALS })
  }

  render() {
    const nodeId = this.props.params.nodeId
    const evals = this.props.evaluations.filter(evaluation => evaluation.NodeID === nodeId)

    return <EvaluationList evaluations={evals} nested />
  }
}

function mapStateToProps({ evaluations }) {
  return { evaluations }
}

ClientEvaluations.defaultProps = {
  evaluations: [],
  params: {}
}

ClientEvaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ClientEvaluations)
