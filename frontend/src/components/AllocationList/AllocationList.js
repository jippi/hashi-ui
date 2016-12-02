import React, { Component, PropTypes } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router';
import AllocationListRow from '../AllocationListRow/AllocationListRow';

const jobHeaderColumn = display =>
  (display ? <th>Job</th> : null);

const clientHeaderColumn = display =>
  (display ? <th width="120">Client</th> : null);

let nodeIdToNameCache = {};

class AllocationList extends Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodes !== this.props.nodes) {
      nodeIdToNameCache = {};
    }
  }

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
      <DropdownButton title={ title } key="filter-client-status" id="filter-client-status">
        <li><Link to={ location.pathname } query={{ ...query, status: undefined }}>- Any -</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, status: 'running' }}>Running</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, status: 'complete' }}>Complete</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, status: 'pending' }}>Pending</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, status: 'lost' }}>Lost</Link></li>
        <li><Link to={ location.pathname } query={{ ...query, status: 'failed' }}>Failed</Link></li>
      </DropdownButton>
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
              <li key={ job }>
                <Link to={ location.pathname } query={{ ...query, job }}>{ job }</Link>
              </li>
            );
          });

    jobs.unshift(
      <li key="any-job"><Link to={ location.pathname } query={{ ...query, job: undefined }}>- Any -</Link></li>
    );

    return (
      <DropdownButton title={ title } key="filter-job" id="filter-job">
        { jobs }
      </DropdownButton>
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
              <li key={ client }>
                <Link to={ location.pathname } query={{ ...query, client }}>{ this.findNodeNameById(client) }</Link>
              </li>
            );
          });

    clients.unshift(
      <li key="any-client">
        <Link to={ location.pathname } query={{ ...query, client: undefined }}>- Any -</Link>
      </li>
    );

    return (
      <DropdownButton title={ title } key="filter-client" id="filter-client">
        { clients }
      </DropdownButton>
    );
  }

  render() {
    const props = this.props;
    const showJobColumn = this.props.showJobColumn;
    const showClientColumn = this.props.showClientColumn;
    const className = this.props.containerClassName;

    return (
      <div className={ className }>
        <div className="inline-pad">
          { this.clientFilter() }
              &nbsp;
          { this.clientStatusFilter() }
              &nbsp;
          { this.jobIdFilter() }
        </div>
        <div className="table-responsive table-full-width">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th width="40"></th>
                <th width="100">ID</th>
                { jobHeaderColumn(showJobColumn) }
                <th>Task Group</th>
                <th width="100">Status</th>
                { clientHeaderColumn(showClientColumn) }
                <th width="120">Age</th>
                <th width="50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.filteredAllocations().map((allocation) => {
                return <AllocationListRow { ...props } key={ allocation.ID } allocation={ allocation } />;
              })}
            </tbody>
          </table>
        </div>
      </div>);
  }
}

AllocationList.defaultProps = {
  allocations: [],
  nodes: [],
  location: {},

  showJobColumn: true,
  showClientColumn: true,

  containerClassName: '',
};

AllocationList.propTypes = {
  allocations: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,

  showJobColumn: PropTypes.bool.isRequired,
  showClientColumn: PropTypes.bool.isRequired,

  containerClassName: PropTypes.string.isRequired,
};

export default AllocationList;
