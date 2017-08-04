import React, { Component } from "react"
import PropTypes from "prop-types"
import { Grid, Row, Col } from "react-flexbox-grid"
import FontIcon from "material-ui/FontIcon"
import { Link } from "react-router"
import { Card, CardHeader, CardText } from "material-ui/Card"
import SelectField from "../SelectField/SelectField"
import TextField from "material-ui/TextField"
import MenuItem from "material-ui/MenuItem"
import ReactTooltip from "react-tooltip"
import { Table, Column, Cell } from "fixed-data-table-2"
import AllocationStatusIcon from "../AllocationStatusIcon/AllocationStatusIcon"
import AllocationLink from "../AllocationLink/AllocationLink"
import JobLink from "../JobLink/JobLink"
import ClientLink from "../ClientLink/ClientLink"
import FormatTime from "../FormatTime/FormatTime"

const nodeIdToNameCache = {}
const allocIdRegexp = /\[(\d+)\]/

const getAllocationNumberFromName = allocationName => {
  const match = allocIdRegexp.exec(allocationName)
  return match[1]
}

/* eslint-disable react/prop-types */

const AllocationStatusIconCell = ({ rowIndex, data, ...props }) =>
  <Cell
    {...props}
    onMouseEnter={() => {
      ReactTooltip.show()
    }}
    onMouseLeave={() => {
      ReactTooltip.hide()
    }}
  >
    <AllocationStatusIcon allocation={data[rowIndex]} />
  </Cell>

const AllocationLinkCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    <AllocationLink allocationId={data[rowIndex].ID} />
  </Cell>

const JobLinkCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    <JobLink jobId={data[rowIndex].JobID} />
  </Cell>

const JobTaskGroupLinkCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    <JobLink jobId={data[rowIndex].JobID} taskGroupId={data[rowIndex].TaskGroupId}>
      {data[rowIndex].TaskGroup} (#{getAllocationNumberFromName(data[rowIndex].Name)})
    </JobLink>
  </Cell>

const ClientLinkCell = ({ rowIndex, data, clients, ...props }) =>
  <Cell {...props}>
    <ClientLink clientId={data[rowIndex].NodeID} clients={clients} />
  </Cell>

const AgeCell = ({ rowIndex, data, ...props }) =>
  <Cell
    {...props}
    onMouseEnter={() => {
      ReactTooltip.show()
    }}
    onMouseLeave={() => {
      ReactTooltip.hide()
    }}
  >
    <FormatTime inTable identifier={data[rowIndex].ID} time={data[rowIndex].CreateTime} />
  </Cell>

const StatusCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    {data[rowIndex].ClientStatus}
  </Cell>

const ActionsCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    <AllocationLink allocationId={data[rowIndex].ID} linkAppend="/files" linkQuery={{ path: "/alloc/logs/" }}>
      <FontIcon className="material-icons">format_align_left</FontIcon>
    </AllocationLink>
  </Cell>

/* eslint-disable react/prop-types */

const jobColumn = (allocations, display) =>
  display
    ? <Column header={<Cell>Job</Cell>} cell={<JobLinkCell data={allocations} />} flexGrow={2} width={200} />
    : null

const clientColumn = (allocations, display, clients) =>
  display
    ? <Column
        header={<Cell>Client</Cell>}
        cell={<ClientLinkCell data={allocations} clients={clients} />}
        flexGrow={2}
        width={200}
      />
    : null

class AllocationList extends Component {
  constructor(props) {
    super(props)

    this.resizeHandler = this.updateDimensions.bind(this)
  }

  findNodeNameById(nodeId) {
    if (this.props.nodes.length === 0) {
      return nodeId
    }

    if (nodeId in nodeIdToNameCache) {
      return nodeIdToNameCache[nodeId]
    }

    const r = Object.keys(this.props.nodes).filter(node => this.props.nodes[node].ID === nodeId)

    if (r.length !== 0) {
      nodeIdToNameCache[nodeId] = this.props.nodes[r].Name
    } else {
      nodeIdToNameCache[nodeId] = nodeId
    }

    return nodeIdToNameCache[nodeId]
  }

  filteredAllocations() {
    const query = this.props.location.query || {}
    let allocations = this.props.allocations

    if ("allocation_id" in query) {
      allocations = allocations.filter(allocation => allocation.ID.indexOf(query.allocation_id) != -1)
    }

    if ("allocation_id" in this.state) {
      allocations = allocations.filter(allocation => allocation.ID.indexOf(this.state.allocation_id) != -1)
    }

    if ("status" in query) {
      allocations = allocations.filter(allocation => allocation.ClientStatus === query.status)
    }

    if ("client" in query) {
      allocations = allocations.filter(allocation => allocation.NodeID === query.client)
    }

    if ("job" in query) {
      allocations = allocations.filter(allocation => allocation.JobID === query.job)
    }

    return allocations
  }

  allocationStatusFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}

    let title = "Allocation Status"
    if ("status" in query) {
      title = (
        <span>
          {title}: <code>{query.status}</code>
        </span>
      )
    }

    return (
      <Col key="allocation-status-filter-pane" xs={12} sm={6} md={6} lg={3}>
        <SelectField floatingLabelText={title} maxHeight={200}>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: undefined }
              }}
            >
              - Any -
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: "running" }
              }}
            >
              Running
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: "complete" }
              }}
            >
              Complete
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: "pending" }
              }}
            >
              Pending
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: "lost" }
              }}
            >
              Lost
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              to={{
                pathname: location.pathname,
                query: { ...query, status: "failed" }
              }}
            >
              Failed
            </Link>
          </MenuItem>
        </SelectField>
      </Col>
    )
  }

  allocationIdFilter() {
    return (
      <Col key="allocation-id-filter-pane" xs={12} sm={6} md={6} lg={3}>
        <TextField
          hintText="Allocation ID"
          onChange={(proxy, value) => {
            this.setState({ ...this.state, allocation_id: value })
          }}
        />
      </Col>
    )
  }

  jobIdFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}

    let title = "Job"
    if ("job" in query) {
      title = (
        <span>
          {title}: <code>{query.job}</code>
        </span>
      )
    }

    const jobs = this.props.allocations
      .map(allocation => {
        return allocation.JobID
      })
      .filter((v, i, a) => {
        return a.indexOf(v) === i
      })
      .sort()
      .map(job => {
        return (
          <MenuItem key={job}>
            <Link to={{ pathname: location.pathname, query: { ...query, job } }}>
              {job}
            </Link>
          </MenuItem>
        )
      })

    jobs.unshift(
      <MenuItem key="any-job">
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job: undefined }
          }}
        >
          - Any -
        </Link>
      </MenuItem>
    )

    return (
      <Col key="job-filter-pane" xs={12} sm={6} md={6} lg={3}>
        <SelectField floatingLabelText={title} maxHeight={200}>
          {jobs}
        </SelectField>
      </Col>
    )
  }

  clientFilter() {
    const location = this.props.location
    const query = this.props.location.query || {}

    let title = "Client"

    if ("client" in query) {
      title = (
        <span>
          {title}: <code>{this.findNodeNameById(query.client)}</code>
        </span>
      )
    }

    const clients = this.props.allocations
      .map(allocation => {
        return allocation.NodeID
      })
      .filter((v, i, a) => {
        return a.indexOf(v) === i
      })
      .map(client => {
        return { ID: client, Name: this.findNodeNameById(client) }
      })
      .sort((a, b) => {
        return a.Name.localeCompare(b.Name)
      })
      .map(client => {
        let NodeID = client.ID
        return (
          <MenuItem key={NodeID}>
            <Link to={{ pathname: location.pathname, query: { ...query, NodeID } }}>
              {client.Name}
            </Link>
          </MenuItem>
        )
      })

    clients.unshift(
      <MenuItem key="any-client">
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, client: undefined }
          }}
        >
          - Any -
        </Link>
      </MenuItem>
    )

    return (
      <Col key="client-filter-pane" xs={12} sm={6} md={6} lg={3}>
        <SelectField floatingLabelText={title} maxHeight={200}>
          {clients}
        </SelectField>
      </Col>
    )
  }

  updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeHandler)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler)
  }

  render() {
    const showJobColumn = this.props.showJobColumn
    const showClientColumn = this.props.showClientColumn
    const allocations = this.filteredAllocations()

    let width = this.state.width - 240

    if (!showClientColumn || !showJobColumn) {
      width = width - 30
    }

    let height = this.state.height - 165

    if (!showJobColumn || !showClientColumn || this.props.nested) {
      height = height - 120
    }

    if (height < 300) {
      height = 300
    }

    return (
      <div>
        <Card key="filter">
          <CardText style={{ paddingTop: 0, paddingBottom: 0 }}>
            <Grid fluid style={{ padding: 0 }}>
              <Row>
                {this.allocationIdFilter()}
                {showClientColumn ? this.clientFilter() : null}
                {this.allocationStatusFilter()}
                {showJobColumn ? this.jobIdFilter() : null}
              </Row>
            </Grid>
          </CardText>
        </Card>

        <Card key="list" style={{ marginTop: "1rem" }}>
          <CardText>
            <Table
              key="table"
              rowHeight={35}
              headerHeight={35}
              rowsCount={allocations.length}
              height={height}
              width={width}
              touchScrollEnabled
              {...this.props}
            >
              <Column header={<Cell />} cell={<AllocationStatusIconCell data={allocations} />} width={40} />
              <Column header={<Cell>ID</Cell>} cell={<AllocationLinkCell data={allocations} />} width={100} />
              {jobColumn(allocations, this.props.showJobColumn)}
              <Column
                header={<Cell>Task Group</Cell>}
                cell={<JobTaskGroupLinkCell data={allocations} />}
                flexGrow={2}
                width={200}
              />
              <Column header={<Cell>Status</Cell>} cell={<StatusCell data={allocations} />} width={200} />
              {clientColumn(allocations, this.props.showClientColumn, this.props.nodes)}
              <Column header={<Cell>Age</Cell>} cell={<AgeCell data={allocations} />} width={100} />
              <Column header={<Cell>Actions</Cell>} cell={<ActionsCell data={allocations} />} width={100} />
            </Table>
          </CardText>
          <ReactTooltip />
        </Card>
      </div>
    )
  }
}

AllocationList.defaultProps = {
  allocations: [],
  nodes: [],
  location: {},

  showJobColumn: true,
  showClientColumn: true,
  nested: false
}

AllocationList.propTypes = {
  allocations: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,

  nested: PropTypes.bool.isRequired,

  showJobColumn: PropTypes.bool.isRequired,
  showClientColumn: PropTypes.bool.isRequired
}

export default AllocationList
