import FontIcon from 'material-ui/FontIcon';
import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import AllocationStatusIcon from '../AllocationStatusIcon/AllocationStatusIcon';
import FormatTime from '../FormatTime/FormatTime';
import NomadLink from '../NomadLink/NomadLink';

const getAllocationNumberFromName = (allocationName) => {
  const match = /[\d+]/.exec(allocationName);
  return match[0];
};

const jobColumn = (allocation, display) =>
  (display ? <TableRowColumn><NomadLink jobId={ allocation.JobID } /></TableRowColumn> : null);

const clientColumn = (allocation, nodes, display) =>
  (display
    ?
      <TableRowColumn style={{ width: 120 }}>
        <NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" />
      </TableRowColumn>
    :
      null
  );

const renderDesiredStatus = (allocation) => {
  if (allocation.DesiredDescription) {
    return (
      <div>
        <ReactTooltip id={ `tooltip-${allocation.ID}` }>{allocation.DesiredDescription}</ReactTooltip>
        <span data-tip data-for={ `tooltip-${allocation.ID}` } className="dotted">
          {allocation.DesiredStatus}
        </span>
      </div>
    );
  }

  return <div>{allocation.DesiredStatus}</div>;
};

class AllocationListRow extends Component {

  render() {
    const allocation = this.props.allocation;
    const nodes = this.props.nodes;
    const showJobColumn = this.props.showJobColumn;
    const showClientColumn = this.props.showClientColumn;

    return (
      <TableRow key={ allocation.ID } hoverable>
        <TableRowColumn style={{ width: 40 }}>
          <AllocationStatusIcon allocation={ allocation } />
        </TableRowColumn>
        <TableRowColumn style={{ width: 100 }}>
          <NomadLink allocId={ allocation.ID } short="true" />
        </TableRowColumn>
        { jobColumn(allocation, showJobColumn) }
        <TableRowColumn>
          <NomadLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId }>
            { allocation.TaskGroup } (#{ getAllocationNumberFromName(allocation.Name) })
          </NomadLink>
        </TableRowColumn>
        <TableRowColumn style={{ width: 100 }}>
          { renderDesiredStatus(allocation) }
        </TableRowColumn>
        { clientColumn(allocation, nodes, showClientColumn) }
        <TableRowColumn style={{ width: 120 }}>
          <FormatTime identifier={ allocation.ID } time={ allocation.CreateTime } />
        </TableRowColumn>
        <TableRowColumn style={{ width: 50 }}>
          <NomadLink allocId={ allocation.ID } linkAppend="/files?path=/alloc/logs/">
            <FontIcon className="material-icons">format_align_left</FontIcon>
          </NomadLink>
        </TableRowColumn>
      </TableRow>
    );
  }
}

AllocationListRow.defaultProps = {
  allocations: [],
  nodes: [],

  showJobColumn: true,
  showClientColumn: true,
};

AllocationListRow.propTypes = {
  allocation: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,

  showJobColumn: PropTypes.bool.isRequired,
  showClientColumn: PropTypes.bool.isRequired,
};

export default AllocationListRow;
