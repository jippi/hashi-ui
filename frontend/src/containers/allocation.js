import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import AllocationTopbar from '../components/AllocationTopbar/AllocationTopbar'
import JobLink from '../components/JobLink/JobLink'
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

  getName() {
    const name = this.props.allocation.Name

    return name.substring(
      name.indexOf("[") + 1,
      name.indexOf("]")
    )
  }

  render () {
    if (this.props.allocation == null) {
      return null
    }

    return (
      <div>
        <AllocationTopbar { ...this.props } />

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h2>
            Allocation:

            &nbsp;

            <JobLink jobId={ this.props.allocation.JobID } />

            &nbsp; > &nbsp;

            <JobLink jobId={ this.props.allocation.JobID } taskGroupId={ this.props.allocation.TaskGroupId }>
              { this.props.allocation.TaskGroup }
            </JobLink>

            &nbsp; >

            #{ this.getName() }
          </h2>

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
