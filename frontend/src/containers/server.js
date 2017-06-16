import React, { Component, PropTypes } from "react"
import { connect } from "react-redux"
import ServerTopbar from "../components/ServerTopbar/ServerTopbar"
import { WATCH_MEMBER, UNWATCH_MEMBER } from "../sagas/event"

class Server extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: WATCH_MEMBER,
      payload: this.props.params.memberId,
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: UNWATCH_MEMBER,
      payload: this.props.params.memberId,
    })
  }

  render() {
    if (this.props.member == null) {
      return "Loading ..."
    }

    return (
      <div>
        <ServerTopbar {...this.props} />

        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h2>Server: {this.props.member.Name}</h2>

          <br />

          {this.props.children}
        </div>
      </div>
    )
  }
}

function mapStateToProps({ member }) {
  return { member }
}

Server.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(Server)
