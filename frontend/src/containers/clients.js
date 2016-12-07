import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { WATCH_NODES, UNWATCH_NODES } from '../sagas/event'
import ClientLink from '../components/ClientLink/ClientLink'
import FormatBoolean from '../components/FormatBoolean/FormatBoolean'
import NodeStatus from '../components/NodeStatus/NodeStatus'

class Clients extends Component {

  componentDidMount() {
    this.props.dispatch({ type: WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_NODES })
  }

  render() {
    return (
      <div className='row'>
        <div className='col-md-12'>
          <div className='card'>
            <div className='header'>
              <h4 className='title'>Clients</h4>
            </div>
            <div className='content table-responsive table-full-width'>
              <table className='table table-hover table-striped'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Drain</th>
                    <th>Datacenter</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  { this.props.nodes.map(node =>
                    <tr key={ node.ID }>
                      <td><ClientLink clientId={ node.ID } clients={ this.props.nodes } /></td>
                      <td>{ node.Name }</td>
                      <td><NodeStatus value={ node.Status } /></td>
                      <td><FormatBoolean value={ node.Drain } /></td>
                      <td>{ node.Datacenter }</td>
                      <td>{ node.NodeClass ? node.NodeClass : '<none>'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ nodes }) {
  return { nodes }
}

Clients.propTypes = {
  nodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Clients)
