import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Badge } from 'react-bootstrap';

const metricColor = {
    Running: "text-success" ,
    Complete: "text-success",
    Starting: "text-warning",
    Queued: "text-warning",
    Failed: "text-danger",
    Lost: "text-danger"
}

class Statistics extends Component {

    render() {
        let clientStatus = {
            Running: 0,
            Starting: 0,
        };

        this.props.jobs.forEach((job) => {
            for (let taskGroup in job.JobSummary.Summary) {
                if (!job.JobSummary.Summary.hasOwnProperty(taskGroup)) {
                    continue;
                }

                for (let task in job.JobSummary.Summary[taskGroup]) {
                    if (!job.JobSummary.Summary[taskGroup].hasOwnProperty(task)) {
                        continue;
                    }

                    if (!(task in clientStatus)) {
                        clientStatus[task] = 0;
                    }
                    clientStatus[task] += job.JobSummary.Summary[taskGroup][task]
                }
            }
        })

        let batches = [];
        for (let key in clientStatus) {
            if (!clientStatus.hasOwnProperty(key)) {
                continue;
            }

            let bsStyle;
            if (key in metricColor) {
                bsStyle = metricColor[key]
            }

            batches.push(<div key={key} className={"col-xs-4 col-md-2 " + bsStyle}>{key} <Badge>{clientStatus[key]}</Badge></div>)
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
