import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import ClientTopbar from "../components/ClientTopbar/ClientTopbar"
import ClientActionMenu from "../components/ClientActionMenu/ClientActionMenu"
import { NOMAD_WATCH_NODE, NOMAD_UNWATCH_NODE } from "../sagas/event"

class Client extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: NOMAD_WATCH_NODE,
      payload: this.props.params.nodeId
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_NODE,
      payload: this.props.params.nodeId
    })
  }

  render() {
    if (this.props.node.Name == null) {
      return <div>Loading ...</div>
    }

    return (
      <div>
        <div style={{ float: "left" }}>
          <h3 style={{ marginTop: "10px" }}>
            Client: {this.props.node.Name}
          </h3>
        </div>

        <div style={{ float: "right" }}>
          <ClientActionMenu node={this.props.node} />
        </div>

        <ClientTopbar {...this.props} />

        <div style={{ clear: "both", paddingTop: "1rem" }} />

        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps({ node }) {
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
