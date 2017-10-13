import React, { Component } from "react"
import FontIcon from "material-ui/FontIcon"
import { Column, Cell } from "fixed-data-table-2"
import { NOMAD_WATCH_ALLOCATION_HEALTH, NOMAD_UNWATCH_ALLOCATION_HEALTH } from "../../sagas/event"
import { green500, red500, grey200 } from "material-ui/styles/colors"

const AllocationConsulHealthCell = ({ rowIndex, dispatch, allocationHealth, nodes, data, ...props }) => (
  <Cell rowIndex={rowIndex} data={data} {...props}>
    <AllocationConsulHealth
      dispatch={dispatch}
      allocation={data[rowIndex]}
      allocationHealth={allocationHealth[data[rowIndex].ID]}
    />
  </Cell>
)
export { AllocationConsulHealthCell }

class AllocationConsulHealth extends Component {
  componentDidMount() {
    this.watch(this.props)
  }

  componentWillUnmount() {
    this.unwatch(this.props)
  }

  componentWillReceiveProps(nextProps) {
    // if we get a new allocation, unsubscribe from the old and subscribe to the new
    if (this.props.allocation.ID != nextProps.allocation.ID) {
      this.unwatch(this.props)
      this.watch(nextProps)
      return
    }

    // if the current allocation changed from running to something else, unsubscribe
    if (this.props.allocation.ClientStatus == "running" && nextProps.allocation.ClientStatus != "running") {
      this.unwatch(this.props)
    }

    // if the current allocation changed anything to running, subscrube to health
    if (this.props.allocation.ClientStatus != "running" && nextProps.allocation.ClientStatus == "running") {
      this.watch(nextProps)
    }
  }

  unwatch(props) {
    this.props.dispatch({
      type: NOMAD_UNWATCH_ALLOCATION_HEALTH,
      payload: {
        id: props.allocation.ID,
        client: props.allocation.NodeID
      }
    })
  }

  watch(props) {
    this.props.dispatch({
      type: NOMAD_WATCH_ALLOCATION_HEALTH,
      payload: {
        id: props.allocation.ID,
        client: props.allocation.NodeID
      }
    })
  }

  render() {
    // can't be any health status for non-running jobs
    if (this.props.allocation.ClientStatus != "running") {
      return null
    }

    const health = this.props.allocationHealth

    if (!health) {
      return (
        <FontIcon title="Unknown Consul Health" color={grey200} className="material-icons">
          help_outline
        </FontIcon>
      )
    }

    let icon = ""

    if (health.Healthy) {
      icon = (
        <FontIcon title="All Consul Health checks OK" color={green500} className="material-icons">
          {health.Total > 1 ? "done_all" : "done"}
        </FontIcon>
      )
    }

    if (health.Healthy == false) {
      icon = (
        <FontIcon color={red500} className="material-icons">
          clear
        </FontIcon>
      )
    }

    return <span>{icon}</span>
  }
}

export default AllocationConsulHealth
