import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Badge } from 'react-bootstrap';

const positiveMetrics = ["Running", "Complete"]
const warningMetrics = ["Starting", "Queued"]
const errorMetrics = ["Failed", "Lost"]

class Statistics extends Component {

    render() {
        let clientStatus = {
            Running: 0,
            Starting: 0,
        };

        this.props.jobs.forEach((job) => {
            for (let taskGroup in job.JobSummary.Summary) {
                for (let task in job.JobSummary.Summary[taskGroup]) {
                    if (!(task in clientStatus)) {
                        clientStatus[task] = 0;
                    }
                    clientStatus[task] += job.JobSummary.Summary[taskGroup][task]
                }
            }
        })

        let batches = [];
        for (let key in clientStatus) {
            let bsStyle;

            if (positiveMetrics.indexOf(key) !== -1) {
                bsStyle = "text-success"
            }

            if (warningMetrics.indexOf(key) !== -1) {
                bsStyle = "text-warning"
            }

            if (errorMetrics.indexOf(key) !== -1) {
                bsStyle = "text-danger"
            }

            batches.push(<div className={"col-xs-4 col-md-2 " + bsStyle}>{key} <Badge>{clientStatus[key]}</Badge></div>)
        }

        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="content center table-responsive statistics-big">
                            <div className="row">{batches}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ jobs }) {
    return { jobs }
}

export default connect(mapStateToProps)(Statistics)
