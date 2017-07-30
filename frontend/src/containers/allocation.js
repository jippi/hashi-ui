import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { orange500 } from "material-ui/styles/colors"
import FontIcon from "material-ui/FontIcon"
import AllocationTopbar from "../components/AllocationTopbar/AllocationTopbar"
import JobLink from "../components/JobLink/JobLink"
import AllocationLink from "../components/AllocationLink/AllocationLink"
import ClientLink from "../components/ClientLink/ClientLink"
import { WATCH_ALLOC, UNWATCH_ALLOC, WATCH_ALLOCS, UNWATCH_ALLOCS } from "../sagas/event"

class Allocation extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: WATCH_ALLOC,
      payload: this.props.params.allocId
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: UNWATCH_ALLOC,
      payload: this.props.params.allocId
    })

    this.props.dispatch({
      type: UNWATCH_ALLOCS
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.allocation.DesiredStatus && this.props.allocation.DesiredStatus != "run") {
      if (this.props.allocations.length === 0) {
        this.props.dispatch({ type: WATCH_ALLOCS })
      } else {
        this.props.dispatch({ type: UNWATCH_ALLOCS })
      }
    }

    if (prevProps.params.allocId == this.props.params.allocId) {
      return
    }

    if (prevProps.params.allocId) {
      this.props.dispatch({
        type: UNWATCH_ALLOC,
        payload: prevProps.params.allocId
      })
    }

    this.props.dispatch({
      type: WATCH_ALLOC,
      payload: this.props.params.allocId
    })
  }

  getName() {
    const name = this.props.allocation.Name

    return name.substring(name.indexOf("[") + 1, name.indexOf("]"))
  }

  derp() {
    if (this.props.allocation.DesiredStatus == "run") {
      return
    }

    if (this.props.allocations.length == 0) {
      return
    }

    let alt = this.props.allocations.filter(
      a => a.Name == this.props.allocation.Name && a.ID != this.props.allocation.ID && a.DesiredStatus == "run"
    )

    if (alt.length == 0) {
      return
    }

    alt = alt[0]
    return (
      <div className="warning-bar" style={{ backgroundColor: orange500 }}>
        <FontIcon className="material-icons" color="white">
          info
        </FontIcon>
        <div>
          <AllocationLink allocationId={alt.ID}>View replacement allocation</AllocationLink>
        </div>
      </div>
    )
  }

  render() {
    if (this.props.allocation.ID == null) {
      return <div>Loading allocation ...</div>
    }

    return (
      <div>
        <div style={{ padding: 10, paddingBottom: 0 }}>
          <h3>
            Allocation: &nbsp;
            <JobLink jobId={this.props.allocation.JobID} />
            &nbsp; > &nbsp;
            <JobLink jobId={this.props.allocation.JobID} taskGroupId={this.props.allocation.TaskGroupId}>
              {this.props.allocation.TaskGroup}
            </JobLink>
            &nbsp; #{this.getName()}
            &nbsp; @ <ClientLink clientId={this.props.allocation.NodeID} clients={this.props.nodes} />
          </h3>

          {this.derp()}

          <br />

          <AllocationTopbar {...this.props} />

          <br />

          {this.props.children}
        </div>
      </div>
    )
  }
}

function mapStateToProps({ allocation, allocations, nodes }) {
  return { allocation, allocations, nodes }
}

Allocation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired,
  allocations: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line no-unused-vars
  children: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Allocation)
