import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { WATCH_EVALS, UNWATCH_EVALS } from '../sagas/event'
import EvaluationList from '../components/EvaluationList/EvaluationList'

class Evaluations extends Component {

  componentDidMount() {
    this.props.dispatch({ type: WATCH_EVALS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_EVALS })
  }

  render() {
    return (
      <div className='row'>
        <div className='col-md-12'>
          <div className='card'>
            <div className='header'>
              <h4 className='title'>Evaluations</h4>
            </div>
            <EvaluationList evaluations={ this.props.evaluations } containerClassName='content' />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ evaluations }) {
  return { evaluations }
}

Evaluations.defaultProps = {
  evaluations: {}
}

Evaluations.propTypes = {
  evaluations: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Evaluations)
