import React, { Component, PropTypes } from 'react';
import { Panel, Accordion, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import NomadLink from '../link';
import Meta from '../meta';
import FormatTime from '../format/time';

const allocProps = [
    'ID',
    'Name',
    'ClientStatus',
    'ClientDescription',
    'DesiredStatus',
    'DesiredDescription',
];

class AllocationInfo extends Component {

    static taskState(allocation, name, states) {
        const title = (
          <h3>
            Task state for {allocation.JobID}.{allocation.TaskGroup}.{name} (final state: {states.State})
          </h3>
        );
        let lastEventTime = null;

        return (
          <Panel key={ name } header={ title }>
            <div className="content table-responsive table-full-width">
              <Table striped hover style={{ 'table-layout': 'fixed' }}>
                <thead>
                  <tr>
                    <th width="150">When</th>
                    <th width="150">Duration</th>
                    <th width="150">Type</th>
                    <th>Message / Reason</th>
                    <th width="50">Code</th>
                    <th width="50">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  { states.Events.map((element, index) => {
                      if (!lastEventTime) {
                          lastEventTime = element.Time;
                      }

                      const output = (
                        <tr key={ index }>
                          <td><FormatTime time={ element.Time } /></td>
                          <td>
                            <FormatTime
                              time={ element.Time }
                              now={ lastEventTime }
                              durationInterval="ms"
                              durationFormat="h [hour] m [min] s [seconds] S [ms]"
                            />
                          </td>
                          <td>{ element.Type }</td>
                          <td>
                            {
                              element.Message
                              || element.SetupError
                              || element.DriverError
                              || element.KillError
                              || element.DownloadError
                              || element.ValidationError
                              || element.VaultError
                              || element.RestartReason
                              || element.KillReason
                              || element.TaskSignalReason
                            }
                          </td>
                          <td>{ element.ExitCode }</td>
                          <td>{ element.Signal || element.TaskSignal || 'N/A' }</td>
                        </tr>
                      );

                      lastEventTime = element.Time;
                      return output;
                  })}
                </tbody>
              </Table>
            </div>
          </Panel>
        );
    }

    render() {
        const allocation = this.props.allocation;
        const jobId = allocation.JobID;
        const nodeId = allocation.NodeID;
        const taskGroupId = allocation.TaskGroupId;

        const allocValues = {};
        allocProps.map((allocProp) => {
            allocValues[allocProp] = allocation[allocProp];
            return null;
        });

        allocValues.Job = <NomadLink jobId={ jobId } />;
        allocValues.TaskGroup = (
          <NomadLink jobId={ jobId } taskGroupId={ taskGroupId } >
            {allocation.TaskGroup}
          </NomadLink>
        );
        allocValues.Node = <NomadLink nodeId={ nodeId } nodeList={ this.props.nodes } />;

        const states = [];
        Object.keys(allocation.TaskStates || {}).forEach((key) => {
            states.push(AllocationInfo.taskState(allocation, key, allocation.TaskStates[key]));
        });

        return (
          <div className="tab-pane active">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
                <legend>Allocation Properties</legend>
                <Meta metaBag={ allocValues } sortKeys={ false } />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-sx-12 tab-column">
                <legend>Task States</legend>
                <Accordion>{ states }</Accordion>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ allocation, nodes }) {
    return { allocation, nodes };
}

AllocationInfo.propTypes = {
    allocation: PropTypes.object.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(AllocationInfo);
