import React, { Component, PropTypes } from 'react';
import { DropdownButton, Glyphicon } from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';
import NomadLink from '../NomadLink/NomadLink';
import FormatTime from '../FormatTime/FormatTime';
import shortUUID from '../../helpers/uuid';

const optionsGlyph = <Glyphicon glyph="option-vertical" />;

const clientStatusIcon = {
  complete: <span><Glyphicon glyph="stop" /></span>,
  running: <span className="text-success"><Glyphicon glyph="play" /></span>,
  lost: <span className="text-danger"><Glyphicon glyph="remove" /></span>,
  failed: <span className="text-danger"><Glyphicon glyph="exclamation-sign" /></span>,
};

const getAllocationNumberFromName = (allocationName) => {
  const match = /[\d+]/.exec(allocationName);
  return match[0];
};

const renderClientStatus = (allocation) => {
  let icon = null;

  if (allocation.ClientStatus in clientStatusIcon) {
    icon = clientStatusIcon[allocation.ClientStatus];
  }

  return (
    <div>
      <ReactTooltip id={ `client-status-${allocation.ID}` }>{allocation.ClientStatus}</ReactTooltip>
      <span data-tip data-for={ `client-status-${allocation.ID}` }>{icon}</span>
    </div>
  );
};

const jobColumn = (allocation, display) =>
  (display ? <td><NomadLink jobId={ allocation.JobID } /></td> : null);

const clientColumn = (allocation, nodes, display) =>
  (display ? <td><NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" /></td> : null);

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
      <tr key={ allocation.ID }>
        <td>{ renderClientStatus(allocation) }</td>
        <td><NomadLink allocId={ allocation.ID } short="true" /></td>
        { jobColumn(allocation, showJobColumn, nodes) }
        <td>
          <NomadLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId }>
            { allocation.TaskGroup } (#{ getAllocationNumberFromName(allocation.Name) })
          </NomadLink>
        </td>
        <td>{ renderDesiredStatus(allocation) }</td>
        { clientColumn(allocation, nodes, showClientColumn) }
        <td><FormatTime time={ allocation.CreateTime } /></td>
        <td className="td-actions">
          <NomadLink
            className="btn btn-xs btn-info btn-simple"
            allocId={ allocation.ID }
            linkAppend="/files?path=/alloc/logs/"
          >
            <Glyphicon glyph="align-left" />
          </NomadLink>

          <DropdownButton
            noCaret
            pullRight
            className="btn btn-xs btn-simple pull-right"
            title={ optionsGlyph }
            key={ allocation.Name }
            id={ `actions-${allocation.Name}` }
          >
            <li>
              <NomadLink role="menuitem" evalId={ allocation.EvalID }>
                Evaluation <code>{ shortUUID(allocation.EvalID) }</code>
              </NomadLink>
            </li>
            <li>
              <NomadLink role="menuitem" allocId={ allocation.ID } linkAppend="/files">
                Files
              </NomadLink>
            </li>
            <li>
              <NomadLink role="menuitem" allocId={ allocation.ID }>Task States</NomadLink>
            </li>
          </DropdownButton>
        </td>
      </tr>
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
