import React, { Component } from 'react';
import { connect } from 'react-redux';

class Events extends Component {

    render() {

        const taskEvents = []
        this.props.allocations.forEach((allocation) => {
            if (allocation.TaskStates != null) {
                Object.keys(allocation.TaskStates).forEach((task) => {
                    allocation.TaskStates[task].Events.reverse().forEach((event) => {
                        if (taskEvents.length === 10) return
                        let eventID = task + '.' + event.Time
                        taskEvents.push(
                            <tr key={eventID}>
                                <td>{task}</td>
                                <td>{event.Type}</td>
                                <td>{event.KillError || event.DriverError || event.DownloadError || event.RestartReason || event.Message || "<none>" }</td>
                            </tr>
                        )
                    })
                })
            }
        })

        const blockedEvals = []
        this.props.evaluations.forEach((evaluation) => {
            // Check if Job is still pending
            const pendingJobs = this.props.jobs.filter((job) => { return job.ID === evaluation.JobID && job.Status === "pending" })
            if (pendingJobs.length === 0) return

            if (evaluation.FailedTGAllocs != null) {
                Object.keys(evaluation.FailedTGAllocs).forEach((taskGroup) => {
                    let reasons = []
                    if (evaluation.FailedTGAllocs[taskGroup].ConstraintFiltered != null) {
                        reasons.push(Object.keys(evaluation.FailedTGAllocs[taskGroup].ConstraintFiltered))
                    }

                    if (evaluation.FailedTGAllocs[taskGroup].DimensionExhausted != null) {
                        reasons.push(Object.keys(evaluation.FailedTGAllocs[taskGroup].DimensionExhausted))
                    }

                    blockedEvals.push(
                        <tr key={evaluation.ID}>
                            <td>{evaluation.JobID}</td>
                            <td>{taskGroup}</td>
                            <td>{reasons}</td>
                            <td>{evaluation.ID.substr(0,8)}</td>
                        </tr>
                    )
                })
            }
        })

        return (
            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Task Events</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Type</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { taskEvents }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Pending Jobs</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>Job</th>
                                        <th>Task Group</th>
                                        <th>Reason</th>
                                        <th>Evaluation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { blockedEvals }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocations, evaluations, jobs }) {
    return { allocations, evaluations, jobs }
}

export default connect(mapStateToProps)(Events)
