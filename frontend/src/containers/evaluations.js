import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { WATCH_EVALS, UNWATCH_EVALS } from "../sagas/event"
import EvaluationList from "../components/EvaluationList/EvaluationList"

class Evaluations extends Component {
  componentDidMount() {
    this.props.dispatch({ type: WATCH_EVALS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_EVALS })
  }

  render() {
    return <EvaluationList evaluations={this.props.evaluations} containerClassName="content" />
  }
}

function mapStateToProps({ evaluations }) {
  return { evaluations }
}

Evaluations.defaultProps = {
  evaluations: {}
}

Evaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Evaluations)
