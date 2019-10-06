import React, { Component } from "react"
import { connect } from "react-redux"
import FontIcon from "material-ui/FontIcon"
import { NOMAD_WATCH_ALLOCATION_HEALTH, NOMAD_UNWATCH_ALLOCATION_HEALTH } from "../../sagas/event"
import { green, red, grey } from '@material-ui/core/colors';
import Tooltip from "@material-ui/core/Tooltip"

const green500 = green['500'];
const red500 = red['500'];
const grey200 = grey['200'];

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
      this.watch(nextProps)
      this.unwatch(this.props)
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
    if (!window.CONSUL_ENABLED) {
      return
    }

    this.props.dispatch({
      type: NOMAD_UNWATCH_ALLOCATION_HEALTH,
      payload: {
        id: props.allocation.ID,
        client: props.allocation.NodeID
      }
    })
  }

  watch(props) {
    if (!window.CONSUL_ENABLED) {
      return
    }

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
    if (!window.CONSUL_ENABLED || this.props.allocation.ClientStatus != "running") {
      return null
    }

    const health = this.props.health

    let style = {}
    if (this.props.header) {
      style = { fontSize: "1.5em", verticalAlign: "middle", marginTop: -5 }
    }

    if (!health) {
      return (
        <Tooltip title="Unknown Consul Health">
          <FontIcon style={style} color={grey200} className="material-icons">
            help_outline
          </FontIcon>
        </Tooltip>
      )
    }

    let icon = ""

    if (health.Healthy) {
      icon = (
        <Tooltip title="All Consul Health checks OK">
          <FontIcon style={style} color={green500} className="material-icons">
            {health.Total > 1 ? "done_all" : "done"}
          </FontIcon>
        </Tooltip>
      )
    }

    if (health.Healthy == false) {
      icon = (
        <Tooltip title="Consul Health checks OK">
          <FontIcon style={style} color={red500} className="material-icons">
            clear
          </FontIcon>
        </Tooltip>
      )
    }

    return <span>{icon}</span>
  }
}

function mapStateToProps({ allocationHealth }, { allocation }) {
  return {
    allocation,
    health: allocationHealth[allocation.ID]
  }
}

export default connect(mapStateToProps)(AllocationConsulHealth)
