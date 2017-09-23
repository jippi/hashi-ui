import React, { Component } from "react"
import PropTypes from "prop-types"
import { Grid, Row, Col } from "react-flexbox-grid"
import { connect } from "react-redux"
import { green500, yellow500, lime500 } from "material-ui/styles/colors"
import { green200, yellow200, lime200 } from "material-ui/styles/colors"
import { NOMAD_WATCH_ALLOC_STATS, NOMAD_UNWATCH_ALLOC_STATS } from "../../sagas/event"
import UtilizationAreaChart from "../UtilizationAreaChart/UtilizationAreaChart"
import format from "date-fns/format"


class StatsSet extends Component {
  constructor(props) {
    super(props)
    this.data = {
      CPU: [],
      Memory: []
    }
    this.prefillData()
  }

  prefillData() {
    for(let i=0; i<60; i++)   {
      this.data.CPU.push({name: '', Used: 0})
      this.data.Memory.push({name: '', RSS: 0, Cache: 0, Swap: 0})
    }
  }

  render() {
    this.data.CPU.push({
      name: format(new Date(), "H:mm:ss"),
      Used: this.props.data.CpuStats.TotalTicks
    })
    if (this.data.CPU.length > 60) {
      this.data.CPU.splice(0, 1)
    }
    this.data.Memory.push({
      name: format(new Date(), "H:mm:ss"),
      RSS: this.props.data.MemoryStats.RSS / 1024 / 1024,
      Cache: this.props.data.MemoryStats.Cache / 1024 / 1024,
      Swap: this.props.data.MemoryStats.Swap / 1024 / 1024
    })
    if (this.data.Memory.length > 60) {
      this.data.Memory.splice(0, 1)
    }

    const CPUItems = [
      { name: 'Used', stroke: green500, fill: green200 },
    ]

    const MemoryItems = [
      { name: 'RSS',   stroke: green500,  fill: green200 },
      { name: 'Cache', stroke: lime500,   fill: lime200 },
      { name: 'Swap',  stroke: yellow500, fill: yellow200 }
    ]
    return (
      <Grid fluid style={{ padding: 0 }}>
        <h3>{this.props.title}</h3>
        <Row>
          <Col key="cpu-utilization-pane" xs={12} sm={4} md={4} lg={4}>
            <UtilizationAreaChart title="CPU usage (MHz)" data={this.data.CPU} items={CPUItems} />
          </Col>
          <Col key="memory-utilization-pane" xs={12} sm={4} md={4} lg={4}>
            <UtilizationAreaChart title="RAM usage (MB)" data={this.data.Memory} items={MemoryItems} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

class AllocStats extends Component {
  constructor(props) {
    super(props)
    if (props.allocation.ID) {
      this.watchForStats(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.allocation.ID && nextProps.allocation.ID) {
      this.watchForStats(nextProps)
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_ALLOC_STATS,
      payload: this.props.allocation.ID
    })
  }

  watchForStats(props) {
    this.props.dispatch({
      type: NOMAD_WATCH_ALLOC_STATS,
      payload: props.allocation.ID
    })
  }

  render() {
    if (!this.props.allocStats.ResourceUsage) {
      return <div>Loading ...</div>
    }

    let statsSets = [
      <StatsSet key="allocation" title="All tasks" data={this.props.allocStats.ResourceUsage}/>
    ]
    Object.keys(this.props.allocStats.Tasks).map((key, index) =>
      statsSets.push(<StatsSet key={key} title={key} data={this.props.allocStats.Tasks[key].ResourceUsage}/>)
    )

    return (
      <div>
        {statsSets}
      </div>
    )
  }
}

function mapStateToProps({ allocation, allocStats }) {
  return { allocation, allocStats }
}

AllocStats.propTypes = {
  allocation: PropTypes.object.isRequired,
  allocStats: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(AllocStats)
