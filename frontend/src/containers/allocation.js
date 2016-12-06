import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ViewAllocationTopbar from '../components/ViewAllocationTopbar/ViewAllocationTopbar'
import { WATCH_ALLOC, UNWATCH_ALLOC } from '../sagas/event'

class Allocation extends Component {

  componentWillMount () {
    this.props.dispatch({
      type: WATCH_ALLOC,
      payload: this.props.params.allocId
    })
  }

  componentWillUnmount () {
    this.props.dispatch({
      type: UNWATCH_ALLOC,
      payload: this.props.params.allocId
    })
  }

  render () {
    if (this.props.allocation == null) {
      return null
    }

    return (
      <div>
        <ViewAllocationTopbar { ...this.props } />

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h2>Allocation: { this.props.allocation.Name }</h2>

          <br />

          { this.props.children }
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ allocation }) {
  return { allocation }
}

Allocation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line no-unused-vars
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Allocation)
