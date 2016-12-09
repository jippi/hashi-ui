import FontIcon from 'material-ui/FontIcon'
import React, { Component, PropTypes } from 'react'
import ReactTooltip from 'react-tooltip'
import { TableRow, TableRowColumn } from '../Table'
import shallowEqual from 'recompose/shallowEqual'

import AllocationStatusIcon from '../AllocationStatusIcon/AllocationStatusIcon'
import FormatTime from '../FormatTime/FormatTime'
import ClientLink from '../ClientLink/ClientLink'
import AllocationLink from '../AllocationLink/AllocationLink'
import JobLink from '../JobLink/JobLink'

const getAllocationNumberFromName = (allocationName) => {
  const match = /[\d+]/.exec(allocationName)
  return match[0]
}

const jobColumn = (allocation, display) =>
  (display
    ?
      <TableRowColumn>
        <JobLink jobId={ allocation.JobID } />
      </TableRowColumn>
    : null
  )

const clientColumn = (allocation, clients, display) =>
  (display
    ?
      <TableRowColumn style={{ width: 120 }}>
        <ClientLink clientId={ allocation.NodeID } clients={ clients } short />
      </TableRowColumn>
    : null
  )

const renderDesiredStatus = (allocation) => {
  if (allocation.DesiredDescription) {
    return (
      <div>
        <ReactTooltip id={ `tooltip-${allocation.ID}` }>{allocation.DesiredDescription}</ReactTooltip>
        <span data-tip data-for={ `tooltip-${allocation.ID}` } className='dotted'>
          {allocation.DesiredStatus}
        </span>
      </div>
    )
  }

  return <div>{allocation.DesiredStatus}</div>
}

class AllocationListRow extends Component {

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return (
      // if we don't got any nodes, and we are provided some nodes, update the component
      (this.props.nodes.length === 0 && nextProps.nodes.length > 0) ||

      // update if the allocation changed
      !shallowEqual(this.props.allocation, nextProps.allocation) ||

      // update on state change (could be removed, since we don't use state internally)
      !shallowEqual(this.state, nextState) ||

      // update on context change, (could be removed, don't think we use any state anyway)
      !shallowEqual(this.context, nextContext)
    )
  }

  render () {
    const allocation = this.props.allocation
    const nodes = this.props.nodes
    const showJobColumn = this.props.showJobColumn
    const showClientColumn = this.props.showClientColumn

    return (
      <TableRow key={ allocation.ID }>
        <TableRowColumn style={{ width: 40 }}>
          <AllocationStatusIcon allocation={ allocation } />
        </TableRowColumn>
        <TableRowColumn style={{ width: 100 }}>
          <AllocationLink allocationId={ allocation.ID } />
        </TableRowColumn>
        { jobColumn(allocation, showJobColumn) }
        <TableRowColumn>
          <JobLink jobId={ allocation.JobID } taskGroupId={ allocation.TaskGroupId }>
            { allocation.TaskGroup } (#{ getAllocationNumberFromName(allocation.Name) })
          </JobLink>
        </TableRowColumn>
        <TableRowColumn style={{ width: 100 }}>
          { renderDesiredStatus(allocation) }
        </TableRowColumn>
        { clientColumn(allocation, nodes, showClientColumn) }
        <TableRowColumn style={{ width: 120 }}>
          <FormatTime identifier={ allocation.ID } time={ allocation.CreateTime } />
        </TableRowColumn>
        <TableRowColumn style={{ width: 50 }}>
          <AllocationLink allocationId={ allocation.ID } linkAppend='/files' linkQuery={{ path: '/alloc/logs/' }}>
            <FontIcon className='material-icons'>format_align_left</FontIcon>
          </AllocationLink>
        </TableRowColumn>
      </TableRow>
    )
  }
}

AllocationListRow.defaultProps = {
  allocations: [],
  nodes: [],

  showJobColumn: true,
  showClientColumn: true
}

AllocationListRow.propTypes = {
  allocation: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,

  showJobColumn: PropTypes.bool.isRequired,
  showClientColumn: PropTypes.bool.isRequired
}

export default AllocationListRow
