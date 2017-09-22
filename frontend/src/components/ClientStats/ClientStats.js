import React, { Component } from "react"
import PropTypes from "prop-types"
import { Grid, Row, Col } from "react-flexbox-grid"
import { connect } from "react-redux"
import { NOMAD_WATCH_CLIENT_STATS, NOMAD_UNWATCH_CLIENT_STATS } from "../../sagas/event"
import { green500, blue500, amber500, yellow500 } from "material-ui/styles/colors"
import { Card, CardTitle, CardText } from "material-ui/Card"
import UtilizationPieChart from "../UtilizationPieChart/UtilizationPieChart"
import DiskUtilizationTable from "../DiskUtilizationTable/DiskUtilizationTable"

class ClientStats extends Component {
  constructor(props) {
    super(props)
    if (props.node.ID) {
      this.watchForStats(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.node.ID && nextProps.node.ID) {
      this.watchForStats(nextProps)
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: NOMAD_UNWATCH_CLIENT_STATS,
      payload: this.props.node.ID
    })
  }

  watchForStats(props) {
    this.props.dispatch({
      type: NOMAD_WATCH_CLIENT_STATS,
      payload: props.node.ID
    })
  }

  timeSince(seconds) {
    var interval = Math.floor(seconds / 31536000)

    if (interval > 1) {
      return interval + " years"
    }

    interval = Math.floor(seconds / 2592000)
    if (interval > 1) {
      return interval + " months"
    }

    interval = Math.floor(seconds / 86400)
    if (interval > 1) {
      return interval + " days"
    }

    interval = Math.floor(seconds / 3600)
    if (interval > 1) {
      return interval + " hours"
    }

    interval = Math.floor(seconds / 60)
    if (interval > 1) {
      return interval + " minutes"
    }

    return Math.floor(seconds) + " seconds"
  }

  render() {
    if (!this.props.nodeStats.CPUCores) {
      return <div>Loading ...</div>
    }

    const AllocatedCPU = this.props.nodeStats.CPUAllocatedMHz / this.props.nodeStats.CPUTotalMHz * 100
    const IdleCPU = this.props.nodeStats.CPUIdleTime / this.props.nodeStats.CPUCores
    const UsedCPU = 100 - IdleCPU

    let CompensatedAllocatedCPU = 0
    let CompensatedIdleCPU = 0

    let UsedCPUColor = green500

    if (UsedCPU < AllocatedCPU) {
      CompensatedAllocatedCPU = AllocatedCPU - UsedCPU
      CompensatedIdleCPU = 100 - AllocatedCPU
    } else { // over use of CPU
      UsedCPUColor = amber500
      CompensatedAllocatedCPU = 0
      CompensatedIdleCPU =  100 - UsedCPU
    }

    const cpuChart = [
      {
        name: "busy",
        value: UsedCPU,
        humanValue: UsedCPU.toFixed(0) + " %",
        color: UsedCPUColor
      },
      {
        name: "allocated",
        value: CompensatedAllocatedCPU,
        humanValue: AllocatedCPU.toFixed(0) + " %",
        color: yellow500
      },
      {
        name: "idle",
        value: CompensatedIdleCPU,
        humanValue: IdleCPU.toFixed(0) + " %",
        color: blue500
      }
    ]

    const UsedMemory = this.props.nodeStats.MemoryUsed / 1024 / 1024 / 1024
    const TotalMemory = this.props.nodeStats.MemoryTotal / 1024 / 1024 / 1024
    const FreeMemory = TotalMemory - UsedMemory
    const AllocatedMemory = this.props.nodeStats.MemoryAllocated / 1024

    let CompensatedAllocatedMemory = 0
    let CompensatedFreeMemory = 0

    let UsedMemoryColor = green500

    if (UsedMemory < AllocatedMemory) {
      CompensatedAllocatedMemory = AllocatedMemory - UsedMemory
      CompensatedFreeMemory = TotalMemory - AllocatedMemory
    } else { // over use of Memory
      UsedMemoryColor = amber500
      CompensatedAllocatedMemory = 0
      CompensatedFreeMemory =  TotalMemory - UsedMemory
    }
    const memoryChart = [
      {
        name: "Used",
        value: UsedMemory,
        humanValue: UsedMemory.toFixed(2) + " GB",
        color: UsedMemoryColor
      },
      {
        name: "Allocated",
        value: CompensatedAllocatedMemory,
        humanValue: AllocatedMemory.toFixed(2) + " GB",
        color: yellow500
      },
      {
        name: "Available",
        value: CompensatedFreeMemory,
        humanValue: FreeMemory.toFixed(2) + " GB",
        color: blue500
      }
    ]

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="cpu-utilization-pane" xs={12} sm={4} md={4} lg={4}>
            <UtilizationPieChart title="CPU usage" data={cpuChart} />
          </Col>
          <Col key="memory-utilization-pane" xs={12} sm={4} md={4} lg={4}>
            <UtilizationPieChart title="RAM usage (GB)" data={memoryChart} />
          </Col>
          <Col key="uptime-pane" xs={12} sm={4} md={4} lg={4}>
            <Card>
              <CardTitle title="System uptime" />
              <CardText>
                <div className="client-uptime">
                  {this.timeSince(this.props.nodeStats.Uptime)}
                </div>
              </CardText>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: "1rem" }}>
          <Col xs={12}>
            <DiskUtilizationTable data={this.props.nodeStats.HostDiskStats} title="Disk utilization" />
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps({ node, nodeStats }) {
  return { node, nodeStats }
}

ClientStats.propTypes = {
  node: PropTypes.object.isRequired,
  nodeStats: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ClientStats)
