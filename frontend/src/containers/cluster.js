import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Progressbar from '../components/Progressbar/Progressbar';
import Events from './events';
import Statistics from './statistics';

class Cluster extends Component {

    getChartData() {
        const stats = {
            jobStatus: {
                running: 0,
                pending: 0,
                dead: 0,
            },
            jobTypes: {
                service: 0,
                batch: 0,
                system: 0,
            },
            nodeStatus: {
                ready: 0,
                initializing: 0,
                down: 0,
            },
            memberStatus: {
                alive: 0,
                leaving: 0,
                left: 0,
                shutdown: 0,
            },
        };

        for (const job of this.props.jobs) {
            stats.jobStatus[job.Status] += 1;
            stats.jobTypes[job.Type] += 1;
        }

        for (const node of this.props.nodes) {
            stats.nodeStatus[node.Status] += 1;
        }

        for (const member of this.props.members) {
            stats.memberStatus[member.Status] += 1;
        }

        return stats;
    }

    render() {
        const data = this.getChartData();

        return (
          <div>
            <div className="row">
              <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <Progressbar title="Client Status" data={ data.nodeStatus } />
              </div>
              <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <Progressbar title="Server Status" data={ data.memberStatus } />
              </div>
              <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <Progressbar title="Job Status" data={ data.jobStatus } />
              </div>
              <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <Progressbar title="Job Type" data={ data.jobTypes } />
              </div>
            </div>
            <Statistics />
            <Events />
          </div>
        );
    }
}

function mapStateToProps({ jobs, nodes, members }) {
    return { jobs, nodes, members };
}

Cluster.propTypes = {
    jobs: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    members: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Cluster);
