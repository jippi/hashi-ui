import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationList from "../components/AllocationList/AllocationList"
import {
  NOMAD_WATCH_ALLOCS_SHALLOW,
  NOMAD_UNWATCH_ALLOCS_SHALLOW,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../sagas/event"

class Allocations extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_ALLOCS_SHALLOW })
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_ALLOCS_SHALLOW })
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }

  render() {
    return <AllocationList {...this.props} />
  }
}

function mapStateToProps({ allocations, nodes }) {
  return { allocations, nodes }
}

Allocations.propTypes = {
  allocations: PropTypes.array.isRequired, // eslint-disable-line no-unused-vars
  nodes: PropTypes.array.isRequired, // eslint-disable-line no-unused-vars
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Allocations)
