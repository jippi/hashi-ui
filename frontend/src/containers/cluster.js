import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { green500, blue500, amber500, yellow800 } from "material-ui/styles/colors"
import { Grid, Row, Col } from "react-flexbox-grid"
import Progressbar from "../components/Progressbar/Progressbar"
import UtilizationPieChart from "../components/UtilizationPieChart/UtilizationPieChart"
import ClusterEvents from "../components/ClusterEvents/ClusterEvents"
import ClusterStatistics from "../components/ClusterStatistics/ClusterStatistics"
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

    const UsedMemory = this.props.clusterStatistics.MemoryUsed / 1024 / 1024 / 1024
    const TotalMemory = this.props.clusterStatistics.MemoryTotal / 1024 / 1024 / 1024
    const FreeMemory = TotalMemory - UsedMemory
    const AllocatedMemory = this.props.clusterStatistics.MemoryAllocated / 1024

    let CompensatedAllocatedMemory = 0
    let CompensatedFreeMemory = 0

    let UsedMemoryColor = green500

    if (UsedMemory < AllocatedMemory) {
      CompensatedAllocatedMemory = AllocatedMemory - UsedMemory
      CompensatedFreeMemory = TotalMemory - AllocatedMemory
    } else {
      // over use of Memory
      UsedMemoryColor = amber500
      CompensatedAllocatedMemory = 0
      CompensatedFreeMemory = TotalMemory - UsedMemory
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
        color: yellow800
      },
      {
        name: "Available",
        value: CompensatedFreeMemory,
        humanValue: FreeMemory.toFixed(2) + " GB",
        color: blue500
      }
    ]

    const AllocatedCPU = this.props.clusterStatistics.CPUAllocatedMHz / this.props.clusterStatistics.CPUTotalMHz * 100
    const IdleCPU = this.props.clusterStatistics.CPUIdleTime / this.props.clusterStatistics.CPUCores
    const UsedCPU = 100 - IdleCPU

    let CompensatedAllocatedCPU = 0
    let CompensatedIdleCPU = 0

    let UsedCPUColor = green500

    if (UsedCPU < AllocatedCPU) {
      CompensatedAllocatedCPU = AllocatedCPU - UsedCPU
      CompensatedIdleCPU = 100 - AllocatedCPU
    } else {
      // over use of CPU
      UsedCPUColor = amber500
      CompensatedAllocatedCPU = 0
      CompensatedIdleCPU = 100 - UsedCPU
    }

    const cpuChart = [
      {
        name: "Busy",
        value: UsedCPU,
        humanValue: UsedCPU.toFixed(0) + " %",
        color: UsedCPUColor
      },
      {
        name: "Allocated",
        value: CompensatedAllocatedCPU,
        humanValue: AllocatedCPU.toFixed(0) + " %",
        color: yellow800
      },
      {
        name: "Idle",
        value: CompensatedIdleCPU,
        humanValue: IdleCPU.toFixed(0) + " %",
        color: blue500
      }
    ]

    return (
      <span>
        <Helmet>
          <title>Cluster - Nomad - Hashi-UI</title>
        </Helmet>

        <Grid fluid style={{ padding: 0 }}>
          <Row>
            <Col key="cpu-status-pane" xs={12} sm={4} md={4} lg={4}>
              <UtilizationPieChart title="Cluster CPU usage" data={cpuChart} />
            </Col>
            <Col key="memory-type-pane" xs={12} sm={4} md={4} lg={4}>
              <UtilizationPieChart title="Cluster RAM usage (GB)" data={memoryChart} />
            </Col>
          </Row>
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
