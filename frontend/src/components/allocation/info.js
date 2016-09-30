import React, { Component } from "react";
import { connect } from "react-redux";
import { NomadLink } from "../link";
import MetaDisplay from '../meta'
import DisplayTime from '../time'
import { Panel, Accordion, Table } from 'react-bootstrap'

const allocProps = [
    "ID",
    "Name",
    "ClientStatus",
    "ClientDescription",
    "DesiredStatus",
    "DesiredDescription"
];

class AllocInfo extends Component {

    taskState(allocation, name, states) {
        let title = <h3>Task state for {allocation.JobID}.{allocation.TaskGroup}.{name} (final state: {states.State})</h3>
        let lastEventTime = null;

        return (
            <Panel header={title}>
                <Table striped hover>
                <thead>
                    <tr>
                        <th>When</th>
                        <th>Duration</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Restart Reason</th>
                        <th>Exit Code</th>
                        <th>Signal</th>
                    </tr>
                </thead>
                <tbody>
                {states.Events.map((element, index, array) => {
                    if (!lastEventTime) {
                        lastEventTime = element.Time;
                    }

                    let output = (
                        <tr key={index}>
                            <td width="10%"><DisplayTime time={element.Time} /></td>
                            <td><DisplayTime time={element.Time} now={lastEventTime} durationInterval="ms" durationFormat="h [hour] m [min] s [seconds] S [ms]" /></td>
                            <td>{element.Type}</td>
                            <td>{element.Message}</td>
                            <td>{element.RestartReason}</td>
                            <td>{element.ExitCode}</td>
                            <td>{element.Signal}</td>
                        </tr>
                    )

                    lastEventTime = element.Time;
                    return output;
                })}
                </tbody>
                </Table>
            </Panel>
        )
    }

    render() {
        const allocation = this.props.allocation;
        const jobId = allocation["JobID"];
        const nodeId = allocation["NodeID"];
        const taskGroupId = allocation["TaskGroupId"]

        let allocValues = {};
        allocProps.map((allocProp) => {
            allocValues[allocProp] = allocation[allocProp]
            return null
        });

        allocValues.Job = <NomadLink jobId={jobId} />
        allocValues.TaskGroup = <NomadLink jobId={jobId} taskGroupId={taskGroupId}>{allocation.TaskGroup}</NomadLink>
        allocValues.Node = <NomadLink nodeId={nodeId} nodeList={this.props.nodes} />

        let states = [];
        Object.keys(allocation.TaskStates || {}).forEach((key) => {
            states.push(this.taskState(allocation, key, allocation.TaskStates[key]))
        })

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Allocation Properties</legend>
                    <MetaDisplay metaBag={allocValues} sortKeys={false} />

                    <br />

                    <legend>Task States</legend>
                    <Accordion>{states}</Accordion>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation, nodes }) {
    return { allocation, nodes }
}

export default connect(mapStateToProps)(AllocInfo);
