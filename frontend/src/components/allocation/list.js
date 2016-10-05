import React, { PropTypes } from 'react';
import { DropdownButton } from 'react-bootstrap';
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

const AllocationList = ({ allocations, nodes }) =>
  <table className="table table-hover table-striped">
    <thead>
      <tr>
        <th></th>
        <th>ID</th>
        <th>Job</th>
        <th>Task Group</th>
        <th>Client</th>
        <th>Client Status</th>
        <th>When</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      { allocations.map((allocation) => {
          const color = allocationStatusColors[allocation.ClientStatus];
          return (
            <tr className={ color } key={ allocation.ID }>
              <td>{ renderClientStatus(allocation) }</td>
              <td><NomadLink allocId={ allocation.ID } short="true" /></td>
              <td><NomadLink jobId={ allocation.JobID } short="true" /></td>
              <td>
                <NomadLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId }>
                  { allocation.TaskGroup } ({ getAllocationNumberFromName(allocation.Name) })
                </NomadLink>
              </td>
              <td><NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" /></td>
              <td>{ renderDesiredStatus(allocation) }</td>
              <td><FormatTime time={ allocation.CreateTime } /></td>
              <td>
                <DropdownButton bsSize="small" title="more" key={ allocation.Name } id={ `actions-${allocation.Name}` }>
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
                    <NomadLink role="menuitem" allocId={ allocation.ID } linkAppend="/files?path=/alloc/logs/">
                      Logs
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

AllocationList.propTypes = {
    allocations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default AllocationList;
