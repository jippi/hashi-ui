import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Progressbar from '../components/Progressbar/Progressbar'
import ClusterEvents from '../components/ClusterEvents/ClusterEvents'
import ClusterStatistics from '../components/ClusterStatistics/ClusterStatistics'
import { Grid, Row, Col } from 'react-flexbox-grid'
import {
  WATCH_JOBS, UNWATCH_JOBS,
  WATCH_NODES, UNWATCH_NODES,
  WATCH_MEMBERS, UNWATCH_MEMBERS
} from '../sagas/event'

class Cluster extends Component {

  componentWillMount () {
    this.props.dispatch({ type: WATCH_JOBS })
    this.props.dispatch({ type: WATCH_NODES })
    this.props.dispatch({ type: WATCH_MEMBERS })
  }

  componentWillUnmount () {
    this.props.dispatch({ type: UNWATCH_JOBS })
    this.props.dispatch({ type: UNWATCH_NODES })
    this.props.dispatch({ type: UNWATCH_MEMBERS })
  }

  getChartData () {
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

  render () {
    const data = this.getChartData()

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='job-status-pane' xs={ 12 } sm={ 4 } md={ 4 } lg={ 4 }>
            <Progressbar title='Job Status' data={ data.jobStatus } />
          </Col>
          <Col key='job-type-pane' xs={ 12 } sm={ 4 } md={ 4 } lg={ 4 }>
            <Progressbar title='Job Type' data={ data.jobTypes } />
          </Col>
          <Col key='cluster-type-pane' xs={ 12 } sm={ 4 } md={ 4 } lg={ 4 }>
            <ClusterStatistics />
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }}>
          <Col key='client-pane' xs={ 12 } sm={ 4 } md={ 4 } lg={ 4 }>
            <Progressbar title='Client Status' data={ data.nodeStatus } />
          </Col>
          <Col key='member-pane' xs={ 12 } sm={ 4 } md={ 4 } lg={ 4 }>
            <Progressbar title='Server Status' data={ data.memberStatus } />
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }}>
          <Col key='events-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <ClusterEvents />
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps ({ jobs, nodes, members }) {
  return { jobs, nodes, members }
}

Cluster.propTypes = {
  jobs: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Cluster)
