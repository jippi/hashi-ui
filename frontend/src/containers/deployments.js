import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import DeploymentList from "../components/DeploymentList/DeploymentList"
import { NOMAD_WATCH_DEPLOYMENTS, NOMAD_UNWATCH_DEPLOYMENTS } from "../sagas/event"

class Deployments extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_DEPLOYMENTS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_DEPLOYMENTS })
  }

  render() {
    return (
      <span>
        <Helmet>
          <title>Deployments - Nomad - Hashi-UI</title>
        </Helmet>
        <DeploymentList {...this.props} />
      </span>
    )
  }
}

function mapStateToProps({ deployments }) {
  return { deployments }
}

Deployments.propTypes = {
  deployments: PropTypes.array.isRequired, // eslint-disable-line no-unused-vars
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Deployments)
