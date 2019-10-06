import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { green, blue } from '@material-ui/core/colors';
const green500 = green['500'];
const blue500 = blue['500'];
const green200 = green['200'];
const blue200 = blue['200'];
import { Grid, Row, Col } from "react-flexbox-grid"
import Progressbar from "../components/Progressbar/Progressbar"
import ClusterEvents from "../components/ClusterEvents/ClusterEvents"
import ClusterStatistics from "../components/ClusterStatistics/ClusterStatistics"
import UtilizationAreaChart from "../components/UtilizationAreaChart/UtilizationAreaChart"
import {
  NOMAD_WATCH_JOBS,
  NOMAD_UNWATCH_JOBS,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES,
  NOMAD_WATCH_MEMBERS,
  NOMAD_UNWATCH_MEMBERS,
  NOMAD_WATCH_CLUSTER_STATISTICS,
  NOMAD_UNWATCH_CLUSTER_STATISTICS
} from "../sagas/event"

class Cluster extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_JOBS })
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
    this.props.dispatch({ type: NOMAD_WATCH_MEMBERS })
    this.props.dispatch({ type: NOMAD_WATCH_CLUSTER_STATISTICS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_JOBS })
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
    this.props.dispatch({ type: NOMAD_UNWATCH_MEMBERS })
    this.props.dispatch({ type: NOMAD_UNWATCH_CLUSTER_STATISTICS })
  }

  getChartData() {
    const stats = {
      jobStatus: {
        running: 0,
        pending: 0,
        dead: 0
      },
      jobTypes: {
        service: 0,
        batch: 0,
        system: 0
      },
      nodeStatus: {
        ready: 0,
        initializing: 0,
        down: 0
      },
      memberStatus: {
        alive: 0,
        leaving: 0,
        left: 0,
        shutdown: 0
      }
    }

    for (const job of this.props.jobs) {
      stats.jobStatus[job.Status] += 1
      stats.jobTypes[job.Type] += 1
    }

    for (const node of this.props.nodes) {
      stats.nodeStatus[node.Status] += 1
    }

    for (const member of this.props.members) {
      stats.memberStatus[member.Status] += 1
    }

    return stats
  }

  render() {
    const data = this.getChartData()

    let clusterStats = ""
    if (this.props.clusterStatistics.data) {
      const CPUItems = [
        { name: "Idle", stroke: blue500, fill: blue200 },
        { name: "Used", stroke: green500, fill: green200 }
      ]

      const MemoryItems = [
        { name: "Free", stroke: blue500, fill: blue200 },
        { name: "Used", stroke: green500, fill: green200 }
      ]

      clusterStats = (
        <Row>
          <Col key="cpu-utilization-pane" xs={12} sm={12} md={12} lg={6}>
            <UtilizationAreaChart
              title="CPU usage (%)"
              data={this.props.clusterStatistics.data.cpu}
              items={CPUItems}
              allocated={true}
              min={0}
              max={100}
            />
          </Col>
          <Col key="memory-utilization-pane" xs={12} sm={12} md={12} lg={6}>
            <UtilizationAreaChart
              title="RAM usage (GB)"
              data={this.props.clusterStatistics.data.memory}
              items={MemoryItems}
              allocated={true}
              min={0}
            />
          </Col>
        </Row>
      )
    }

    return (
      <span>
        <Helmet>
          <title>Cluster - Nomad - Hashi-UI</title>
        </Helmet>

        <Grid fluid style={{ padding: 0 }}>
          {clusterStats}
          <Row style={{ marginTop: "1rem" }}>
            <Col key="job-status-pane" xs={12} sm={4} md={4} lg={4}>
              <Progressbar title="Job Status" data={data.jobStatus} />
            </Col>
            <Col key="job-type-pane" xs={12} sm={4} md={4} lg={4}>
              <Progressbar title="Job Type" data={data.jobTypes} />
            </Col>
            <Col key="cluster-type-pane" xs={12} sm={4} md={4} lg={4}>
              <ClusterStatistics />
            </Col>
          </Row>
          <Row style={{ marginTop: "1rem" }}>
            <Col key="client-pane" xs={12} sm={4} md={4} lg={4}>
              <Progressbar title="Client Status" data={data.nodeStatus} />
            </Col>
            <Col key="member-pane" xs={12} sm={4} md={4} lg={4}>
              <Progressbar title="Server Status" data={data.memberStatus} />
            </Col>
          </Row>
          <Row style={{ marginTop: "1rem" }}>
            <Col key="events-pane" xs={12} sm={12} md={12} lg={12}>
              <ClusterEvents />
            </Col>
          </Row>
        </Grid>
      </span>
    )
  }
}

function mapStateToProps({ jobs, nodes, members, clusterStatistics }) {
  return { jobs, nodes, members, clusterStatistics }
}

Cluster.propTypes = {
  jobs: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  clusterStatistics: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Cluster)
