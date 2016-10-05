import React, { PropTypes } from 'react';
import { DropdownButton, Glyphicon } from 'react-bootstrap';
import NomadLink from '../link';
import FormatTime from '../format/time';
import shortUUID from '../../helpers/uuid';
import { renderDesiredStatus, renderClientStatus } from '../../helpers/render/allocation';

const allocationStatusColors = {
    complete: '',
    running: '',
    lost: 'warning',
    failed: 'danger',
};

const getAllocationNumberFromName = (allocationName) => {
    const match = /[\d+]/.exec(allocationName);
    return match[0];
};

const optionsGlyph = <Glyphicon glyph="option-vertical" />;

const jobHeaderColumn = (display) => {
    let output;

    if (display) {
        output = <th>Job</th>;
    }

    return output;
};

const jobColumn = (allocation, display) => {
    let output;

    if (display) {
        output = <td><NomadLink jobId={ allocation.JobID } short="true" /></td>;
    }

    return output;
};

const clientHeaderColumn = (display) => {
    let output;

    if (display) {
        output = <th>Client</th>;
    }

    return output;
};

const clientColumn = (allocation, nodes, display) => {
    let output;

    if (display) {
        output = <td><NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" /></td>;
    }

    return output;
};

const AllocationList = ({ allocations, nodes, showJobColumn, showClientColumn }) =>
  <table className="table table-hover table-striped">
    <thead>
      <tr>
        <th></th>
        <th>ID</th>
        { jobHeaderColumn(showJobColumn) }
        <th>Task Group</th>
        <th>Client Status</th>
        { clientHeaderColumn(showClientColumn) }
        <th>Age</th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {allocations.map((allocation, index) => {
          const color = allocationStatusColors[allocation.ClientStatus];
          return (
            <tr className={ color } key={ allocation.ID }>
              <td>{ renderClientStatus(allocation) }</td>
              <td><NomadLink allocId={ allocation.ID } short="true" /></td>
              { jobColumn(allocation, showJobColumn, nodes) }
              <td>
                <NomadLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId }>
                  { allocation.TaskGroup } ({ getAllocationNumberFromName(allocation.Name) })
                </NomadLink>
              </td>
              <td>{ renderDesiredStatus(allocation) }</td>
              { clientColumn(allocation, nodes, showClientColumn) }
              <td><FormatTime time={ allocation.CreateTime } /></td>
              <td>
                <NomadLink allocId={ allocation.ID } linkAppend="/files?path=/alloc/logs/">
                  <Glyphicon glyph="align-left" />
                </NomadLink>
              </td>
              <td>
                <DropdownButton
                  noCaret
                  pullRight
                  dropup={ index > allocations.length - 4 }
                  className="no-border pull-right"
                  title={ optionsGlyph }
                  key={ allocation.Name }
                  id={ `actions-${allocation.Name}` }
                >
                  <li>
                    <NomadLink role="menuitem" evalId={ allocation.EvalID }>
                      Allocation <code>{ shortUUID(allocation.EvalID) }</code>
                    </NomadLink>
                  </li>
                  <li>
                    <NomadLink role="menuitem" allocId={ allocation.ID } linkAppend="/files">
                      Files
                    </NomadLink>
                  </li>
                  <li>
                    <NomadLink role="menuitem" allocId={ allocation.ID }>
                      Task States
                    </NomadLink>
                  </li>
                </DropdownButton>
              </td>
            </tr>
          );
      })}
    </tbody>
  </table>;

AllocationList.defaultProps = {
    allocation: {},
    nodes: {},

    showJobColumn: true,
    showClientColumn: true,
};

AllocationList.propTypes = {
    allocations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
    showJobColumn: PropTypes.bool.isRequired,
    showClientColumn: PropTypes.bool.isRequired,
};

export default AllocationList;
