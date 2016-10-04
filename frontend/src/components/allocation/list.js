import React, { PropTypes } from 'react';
import NomadLink from '../link';
import FormatTime from '../format/time';
import { renderDesiredStatus, renderClientStatus } from '../../helpers/render/allocation';

const allocationStatusColors = {
    complete: 'success',
    running: 'info',
    lost: 'warning',
    failed: 'danger',
};

const AllocationList = ({ allocations, nodes }) =>
  <table className="table table-hover table-striped">
    <thead>
      <tr>
        <th>ID</th>
        <th>Job</th>
        <th>Task Group</th>
        <th>Task</th>
        <th>Client Status</th>
        <th>Desired Status</th>
        <th>Node</th>
        <th>Evaluation</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      { allocations.map((allocation) => {
          const color = allocationStatusColors[allocation.ClientStatus];
          return (
            <tr className={ color } key={ allocation.ID }>
              <td><NomadLink allocId={ allocation.ID } short="true" /></td>
              <td><NomadLink jobId={ allocation.JobID } short="true" /></td>
              <td>
                <NomadLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId } >
                  {allocation.TaskGroup}
                </NomadLink>
              </td>
              <td>{ allocation.Name }</td>
              <td>{ renderClientStatus(allocation) }</td>
              <td>{ renderDesiredStatus(allocation) }</td>
              <td>
                <NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" />
              </td>
              <td><NomadLink evalId={ allocation.EvalID } short="true" /></td>
              <td><FormatTime time={ allocation.CreateTime } /></td>
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
