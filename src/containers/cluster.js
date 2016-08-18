import React, { Component } from 'react';
import { connect } from 'react-redux';

import Doughnut from '../components/charts/doughnut';
import Events from './events';

const jobStatusLabels = [ "Running", "Pending", "Dead" ]
const jobTypeLabels = [ "Service", "Batch", "System" ]
const nodeStatusLabels = [ "Ready", "Initializing", "Down" ]
const memberStatusLabels = [ "Alive", "Leaving", "Left", "Shutdown" ]

const backgroundColors = [ "#449b82", "#FF9500", "#FF4A55" ]

class Cluster extends Component {

    getChartData() {

        let stats = {
            jobStatus: [0, 0, 0],
            jobTypes: [0, 0, 0],
            nodeStatus: [0, 0, 0],
            memberStatus: [0, 0, 0, 0]
        };

        for (let job of this.props.jobs) {

            switch(job.Status) {
                case 'running':
                    stats.jobStatus[0] += 1;
                    break;
                case 'pending':
                    stats.jobStatus[1] += 1;
                    break;
                case 'dead':
                    stats.jobStatus[2] += 1;
                    break;
                default:
            }

            switch(job.Type) {
                case 'service':
                    stats.jobTypes[0] += 1;
                    break;
                case 'batch':
                    stats.jobTypes[1] += 1;
                    break;
                case 'system':
                    stats.jobTypes[2] += 1;
                    break;
                default:
            }
        }

        for (let node of this.props.nodes) {
            switch(node.Status) {
                case 'ready':
                    stats.nodeStatus[0] += 1;
                    break;
                case 'initializing':
                    stats.nodeStatus[1] += 1;
                    break;
                case 'down':
                    stats.nodeStatus[2] += 1;
                    break;
                default:
            }
        }

        for (let member of this.props.members) {
            switch(member.Status) {
                case 'alive':
                    stats.memberStatus[0] += 1;
                    break;
                case 'leaving':
                    stats.memberStatus[1] += 1;
                    break;
                case 'left':
                    stats.memberStatus[2] += 1;
                    break;
                case 'shutdown':
                    stats.memberStatus[3] += 1;
                    break;
                default:
            }
        }

        return [
            {
                labels: jobStatusLabels,
                datasets: [{
                    data: stats.jobStatus,
                    backgroundColor: backgroundColors
                }]
            },
            {
                labels: jobTypeLabels,
                datasets: [{
                    data: stats.jobTypes,
                    backgroundColor: backgroundColors
                }]
            },
            {
                labels: nodeStatusLabels,
                datasets: [{
                    data: stats.nodeStatus,
                    backgroundColor: backgroundColors
                }]
            },
            {
                labels: memberStatusLabels,
                datasets: [{
                    data: stats.memberStatus,
                    backgroundColor: backgroundColors
                }]
            }
        ]
    }

    render() {
        const [jobStatus, jobTypes, nodeStatus, memberStatus] = this.getChartData()

        return (
            <div>
                <div className="row">
                    <div className="col-md-4">
                        <Doughnut title="Member Status" data={memberStatus} />
                    </div>
                    <div className="col-md-4">
                        <Doughnut title="Node Status" data={nodeStatus} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <Doughnut title="Job Status" data={jobStatus} />
                   </div>
                    <div className="col-md-4">
                        <Doughnut title="Job Type" data={jobTypes} />
                    </div>
                </div>
                <Events />
            </div>
        );
    }
}

function mapStateToProps({ jobs, nodes, members }) {
    return { jobs, nodes, members}
}

export default connect(mapStateToProps)(Cluster);
