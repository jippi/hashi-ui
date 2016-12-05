import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AllocationListRow from '../AllocationListRow/AllocationListRow';

const jobHeaderColumn = display =>
  (display ? <TableHeaderColumn>Job</TableHeaderColumn> : null);

const clientHeaderColumn = display =>
  (display ? <TableHeaderColumn width="120">Client</TableHeaderColumn> : null);

let nodeIdToNameCache = {};

class AllocationList extends Component {

  findNodeNameById(nodeId) {
    if (nodeId in nodeIdToNameCache) {
      return nodeIdToNameCache[nodeId];
    }

    const r = Object.keys(this.props.nodes)
            .filter(node =>
                this.props.nodes[node].ID === nodeId
            );

    if (r.length !== 0) {
      nodeIdToNameCache[nodeId] = this.props.nodes[r].Name;
    } else {
      nodeIdToNameCache[nodeId] = nodeId;
    }

    return nodeIdToNameCache[nodeId];
  }

  filteredAllocations() {
    const query = this.props.location.query || {};
    let allocations = this.props.allocations;

    if ('status' in query) {
      allocations = allocations.filter(allocation => allocation.ClientStatus === query.status);
    }

    if ('client' in query) {
      allocations = allocations.filter(allocation => allocation.NodeID === query.client);
    }

    if ('job' in query) {
      allocations = allocations.filter(allocation => allocation.JobID === query.job);
    }

    return allocations;
  }

  clientStatusFilter() {
    const location = this.props.location;
    const query = this.props.location.query || {};

    let title = 'Client Status';
    if ('status' in query) {
      title = <span>{title}: <code>{ query.status }</code></span>;
    }

    return (
      <SelectField floatingLabelText={ title } maxHeight={ 200 }>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: undefined }}>- Any -</Link></MenuItem>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: 'running' }}>Running</Link></MenuItem>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: 'complete' }}>Complete</Link></MenuItem>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: 'pending' }}>Pending</Link></MenuItem>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: 'lost' }}>Lost</Link></MenuItem>
        <MenuItem><Link to={ location.pathname } query={{ ...query, status: 'failed' }}>Failed</Link></MenuItem>
      </SelectField>
    );
  }

  jobIdFilter() {
    const location = this.props.location;
    const query = this.props.location.query || {};

    let title = 'Job';
    if ('job' in query) {
      title = <span>{title}: <code>{ query.job }</code></span>;
    }

    const jobs = this.props.allocations
          .map((allocation) => {
            return allocation.JobID;
          })
          .filter((v, i, a) => {
            return a.indexOf(v) === i;
          })
          .map((job) => {
            return (
              <MenuItem key={ job }>
                <Link to={ location.pathname } query={{ ...query, job }}>{ job }</Link>
              </MenuItem>
            );
          });

    jobs.unshift(
      <MenuItem key="any-job">
        <Link to={ location.pathname } query={{ ...query, job: undefined }}>- Any -</Link>
      </MenuItem>
    );

    return (
      <SelectField floatingLabelText={ title } maxHeight={ 200 }>{ jobs }</SelectField>
    );
  }

  clientFilter() {
    const location = this.props.location;
    const query = this.props.location.query || {};

    let title = 'Client';

    if ('client' in query) {
      title = <span>{title}: <code>{ this.findNodeNameById(query.client) }</code></span>;
    }

    const clients = this.props.allocations
          .map((allocation) => {
            return allocation.NodeID;
          })
          .filter((v, i, a) => {
            return a.indexOf(v) === i;
          })
          .map((client) => {
            return (
              <MenuItem key={ client }>
                <Link to={ location.pathname } query={{ ...query, client }}>{ this.findNodeNameById(client) }</Link>
              </MenuItem>
            );
          });

    clients.unshift(
      <MenuItem key="any-client">
        <Link to={ location.pathname } query={{ ...query, client: undefined }}>- Any -</Link>
      </MenuItem>
    );

    return (
      <SelectField floatingLabelText={ title } maxHeight={ 200 }>
        { clients }
      </SelectField>
    );
  }

  render() {
    const props = this.props;
    const showJobColumn = this.props.showJobColumn;
    const showClientColumn = this.props.showClientColumn;

    return (
      <div>
        <div className="inline-pad">
          { this.clientFilter() }
              &nbsp;
          { this.clientStatusFilter() }
              &nbsp;
          { this.jobIdFilter() }
        </div>
        <Table selectable={ false } showCheckboxes={ false }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn style={{ width: 40 }} />
              <TableHeaderColumn style={{ width: 100 }}>ID</TableHeaderColumn>
              { jobHeaderColumn(showJobColumn) }
              <TableHeaderColumn>Task Group</TableHeaderColumn>
              <TableHeaderColumn style={{ width: 100}}>Status</TableHeaderColumn>
              { clientHeaderColumn(showClientColumn) }
              <TableHeaderColumn style={{ width: 120 }}>Age</TableHeaderColumn>
              <TableHeaderColumn style={{ width: 50 }}>Actions</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {this.filteredAllocations().map((allocation) => {
              return <AllocationListRow { ...props } key={ allocation.ID } allocation={ allocation } />;
            })}
          </TableBody>
        </Table>
      </div>);
  }
}

AllocationList.defaultProps = {
  allocations: [],
  nodes: [],
  location: {},

  showJobColumn: true,
  showClientColumn: true,
};

AllocationList.propTypes = {
  allocations: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,

  showJobColumn: PropTypes.bool.isRequired,
  showClientColumn: PropTypes.bool.isRequired,
};

export default AllocationList;
