import React, { Component, PropTypes } from 'react';
import { DropdownButton, Glyphicon } from 'react-bootstrap';
import { Link } from 'react-router';
import NomadLink from '../link';
import FormatTime from '../format/time';
import shortUUID from '../../helpers/uuid';
import { renderDesiredStatus, renderClientStatus } from '../../helpers/render/allocation';

const getAllocationNumberFromName = (allocationName) => {
    const match = /[\d+]/.exec(allocationName);
    return match[0];
};

const optionsGlyph = <Glyphicon glyph="option-vertical" />;

const jobHeaderColumn = display =>
    (display ? <th>Job</th> : null);

const jobColumn = (allocation, display) =>
    (display ? <td><NomadLink jobId={ allocation.JobID } short="true" /></td> : null);

const clientHeaderColumn = display =>
    (display ? <th width="120">Client</th> : null);

const clientColumn = (allocation, nodes, display) =>
    (display ? <td><NomadLink nodeId={ allocation.NodeID } nodeList={ nodes } short="true" /></td> : null);

class AllocationList extends Component {

    findNodeNameById(nodeId) {
        const r = Object.keys(this.props.nodes).filter(node =>
            this.props.nodes[node].ID === nodeId
        );

        if (r.length !== 0) {
            return this.props.nodes[r].Name;
        }

        return nodeId;
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
        const showJobColumn = this.props.showJobColumn;
        const showClientColumn = this.props.showClientColumn;
        const allocations = this.props.allocations;
        const nodes = this.props.nodes;
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
                    <th width="120">ID</th>
                    { jobHeaderColumn(showJobColumn) }
                    <th width="120">Task Group</th>
                    <th width="120">Status</th>
                    { clientHeaderColumn(showClientColumn) }
                    <th width="120">Age</th>
                    <th width="120"></th>
                  </tr>
                </thead>
                <tbody>
                  {this.filteredAllocations().map((allocation, index) => {
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
                              dropup={ index > allocations.length - 4 }
                              className="btn btn-xs btn-simple pull-right"
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
                                <NomadLink role="menuitem" allocId={ allocation.ID }>Task States</NomadLink>
                              </li>
                            </DropdownButton>
                          </td>
                        </tr>
                      );
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
