import React, { Component, PropTypes } from "react"
import { Grid, Row, Col } from "react-flexbox-grid"
import { connect } from "react-redux"
import { WATCH_CLIENT_STATS, UNWATCH_CLIENT_STATS } from "../../sagas/event"
import { green500, blue500 } from "material-ui/styles/colors"
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
      type: UNWATCH_CLIENT_STATS,
      payload: this.props.node.ID,
    })
  }

  watchForStats(props) {
    this.props.dispatch({
      type: WATCH_CLIENT_STATS,
      payload: props.node.ID,
    })
  }

  cpuUtilization(cpus) {
    const sum = cpus.reduce((acc, cpu) => {
      return acc + cpu.Idle
    }, 0)

    return Math.ceil(sum / cpus.length)
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
    if (!this.props.nodeStats.CPU) {
      return <div>Loading ...</div>
    }

    const CPU = this.cpuUtilization(this.props.nodeStats.CPU)
    const cpuChart = [
      {
        name: "busy",
        value: 100 - CPU,
        humanValue: 100 - CPU + " %",
        color: green500,
      },
      {
        name: "idle",
        value: CPU,
        humanValue: CPU + " %",
        color: blue500,
      },
    ]

    const TotalMemory = this.props.nodeStats.Memory.Total / 1024 / 1024 / 1024
    const UsedMemory = this.props.nodeStats.Memory.Used / 1024 / 1024 / 1024

    const memoryChart = [
      {
        name: "Used",
        value: UsedMemory,
        humanValue: UsedMemory.toFixed(2) + " GB",
        color: green500,
      },
      {
        name: "Available",
        value: TotalMemory - UsedMemory,
        humanValue: (TotalMemory - UsedMemory).toFixed(2) + " GB",
        color: blue500,
      },
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
            <DiskUtilizationTable data={this.props.nodeStats.DiskStats} title="Disk utilization" />
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
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(ClientStats)
