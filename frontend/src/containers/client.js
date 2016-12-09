import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ClientTopbar from '../components/ClientTopbar/ClientTopbar'
import { WATCH_NODE, UNWATCH_NODE } from '../sagas/event'

class Client extends Component {

  componentWillMount () {
    this.props.dispatch({ type: WATCH_NODE, payload: this.props.params.nodeId })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: UNWATCH_NODE, payload: this.props.params.nodeId })
  }

  render () {
    if (this.props.node == null) {
      return null
    }

    return (
      <div>
        <ClientTopbar { ...this.props } />

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h2>Client: { this.props.node.Name }</h2>

          <br />

          { this.props.children }
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ node }) {
  return { node }
}

Client.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Client)
