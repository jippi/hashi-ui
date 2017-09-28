import React, { Component } from "react"
import PropTypes from "prop-types"
import { Grid, Row, Col } from "react-flexbox-grid"
import { connect } from "react-redux"
import { NOMAD_WATCH_CLIENT_STATS, NOMAD_UNWATCH_CLIENT_STATS } from "../../sagas/event"
import { green500, blue500 } from "material-ui/styles/colors"
import { green200, blue200 } from "material-ui/styles/colors"
import { Card, CardTitle, CardText } from "material-ui/Card"
import DiskUtilizationTable from "../DiskUtilizationTable/DiskUtilizationTable"
import UtilizationAreaChart from "../UtilizationAreaChart/UtilizationAreaChart"

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
    if (!this.props.nodeStats.data) {
      return <div>Loading ...</div>
    }

    let clusterStats = ''
    if (this.props.nodeStats.data) {
      const CPUItems = [
        { name: "Idle", stroke: blue500, fill: blue200 },
        { name: "Used", stroke: green500, fill: green200 },
      ]

      const MemoryItems = [
        { name: "Free", stroke: blue500, fill: blue200 },
        { name: "Used", stroke: green500, fill: green200 },
      ]

      clusterStats =
        <Row>
          <Col key="cpu-utilization-pane" xs={12} sm={12} md={12} lg={6}>
            <UtilizationAreaChart
              title="CPU usage (%)"
              data={this.props.nodeStats.data.cpu}
              items={CPUItems}
              allocated={true}
              min={0}
              max={100}
            />
          </Col>
          <Col key="memory-utilization-pane" xs={12} sm={12} md={12} lg={6}>
            <UtilizationAreaChart
              title="RAM usage (GB)"
              data={this.props.nodeStats.data.memory}
              items={MemoryItems}
              allocated={true}
              min={0}
            />
          </Col>
        </Row>
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        {clusterStats}
        <Row style={{ marginTop: "1rem" }}>
          <Col key="uptime-pane" xs={12} sm={4} md={4} lg={4}>
            <Card>
              <CardTitle title="System uptime" />
              <CardText>
                <div className="client-uptime">{this.timeSince(this.props.nodeStats.Uptime)}</div>
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
