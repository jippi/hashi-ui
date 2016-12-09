import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import EvaluationTopbar from '../components/EvaluationTopbar/EvaluationTopbar'
import { WATCH_EVAL, UNWATCH_EVAL, WATCH_ALLOCS, UNWATCH_ALLOCS } from '../sagas/event'

class Evaluation extends Component {

  componentWillMount () {
    this.props.dispatch({ type: WATCH_EVAL, payload: this.props.params.evalId })
    this.props.dispatch({ type: WATCH_ALLOCS })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: UNWATCH_EVAL, payload: this.props.params.evalId })
    this.props.dispatch({ type: UNWATCH_ALLOCS })
  }

  render () {
    if (this.props.evaluation == null) {
      return (null)
    }

    return (
      <div>
        <EvaluationTopbar />

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h2>Evaluation: { this.props.evaluation.ID }</h2>

          <br />

          { this.props.children }
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

Evaluation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  evaluation: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Evaluation)
