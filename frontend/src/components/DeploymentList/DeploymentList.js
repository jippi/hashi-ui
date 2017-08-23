import { Card, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Table, Column, Cell } from "fixed-data-table-2"
import DeploymentAction from "../DeploymentAction/DeploymentAction"
import DeploymentDistribution from "../DeploymentDistribution/DeploymentDistribution"
import DeploymentLink from "../DeploymentLink/DeploymentLink"
import DeploymentStatusFilter from "../DeploymentStatusFilter/DeploymentStatusFilter"
import FilterFreetext from "../FilterFreetext/FilterFreetext"
import JobLink from "../JobLink/JobLink"
import PropTypes from "prop-types"
import React, { Component } from "react"

/* eslint-disable react/prop-types */

const TextCell = ({ rowIndex, data, col, ...props }) =>
  <Cell {...props}>
    {data[rowIndex][col]}
  </Cell>

const JobLinkCell = ({ rowIndex, data, ...props }) =>
  <Cell {...props}>
    <JobLink jobId={data[rowIndex].JobID} />
  </Cell>

const DeploymentLinkCell = ({ rowIndex, data, col, ...props }) =>
  <Cell {...props}>
    <DeploymentLink deploymentId={data[rowIndex][col]} />
  </Cell>

const DeploymentDistributionCell = ({ rowIndex, data, type, ...props }) =>
  <Cell {...props}>
    <DeploymentDistribution deployment={data[rowIndex]} type={type} />
  </Cell>

const ActionsCell = ({ id, action, rowIndex, data, ...props }) => {
  return (
    <Cell {...props}>
      <DeploymentAction
        key="promote"
        action="promote"
        showText={false}
        id={data[rowIndex].ID}
        status={data[rowIndex].Status}
      />
      <DeploymentAction
        key="fail"
        action="fail"
        showText={false}
        id={data[rowIndex].ID}
        status={data[rowIndex].Status}
      />
      <DeploymentAction
        key="pause"
        action="pause"
        showText={false}
        id={data[rowIndex].ID}
        status={data[rowIndex].Status}
      />
    </Cell>
  )
}

class DeploymentList extends Component {
  updateDimensions() {
    this.setState({
      ...this.state,
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.updateDimensions())
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateDimensions())
  }

  filteredDeployments() {
    const query = this.props.location.query || {}
    let deployments = this.props.deployments

    if ("id" in query) {
      deployments = deployments.filter(deployment => deployment.ID.startsWith(query.id))
    }

    if ("job" in query) {
      deployments = deployments.filter(deployment => deployment.JobID.indexOf(query.job) != -1)
    }

    if ("status" in query) {
      deployments = deployments.filter(deployment => deployment.Status === query.status)
    }

    return deployments
  }

  jobFilter() {
    if (this.props.showJob) {
      return (
        <Col key="job-filter-pane" xs={6} sm={3} md={3} lg={3}>
          <FilterFreetext query="job" label="Job" />
        </Col>
      )
    }
  }

  jobColumn(deployments) {
    if (this.props.showJob) {
      return <Column header={<Cell>Job</Cell>} cell={<JobLinkCell data={deployments} />} flexGrow={2} width={100} />
    }
  }

  render() {
    const deployments = this.filteredDeployments()
    const width = this.state.width - 240
    let height = this.state.height - 90

    if (this.props.nested) {
      height = height - 120
    }

    if (height < 300) {
      height = 300
    }

    return (
      <div>
        <Card>
          <CardText>
            <Grid fluid style={{ padding: 0, margin: 0 }}>
              <Row>
                <Col key="id-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <FilterFreetext query="id" label="ID" />
                </Col>
                {this.jobFilter()}
                <Col key="deployment-status-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <DeploymentStatusFilter />
                </Col>
              </Row>
            </Grid>
          </CardText>
        </Card>
        <Card style={{ marginTop: "1rem" }}>
          <CardText>
            <Table
              rowHeight={35}
              headerHeight={35}
              rowsCount={deployments.length}
              height={height}
              width={width}
              touchScrollEnabled
              {...this.props}
            >
              <Column header={<Cell>ID</Cell>} cell={<DeploymentLinkCell data={deployments} col="ID" />} width={100} />
              {this.jobColumn(deployments)}
              <Column
                header={<Cell>Version</Cell>}
                cell={<TextCell data={deployments} col="JobVersion" />}
                width={100}
              />
              <Column header={<Cell>Status</Cell>} cell={<TextCell data={deployments} col="Status" />} width={150} />
              <Column header={<Cell>Action</Cell>} cell={<ActionsCell data={deployments} />} width={150} />
              <Column
                header={<Cell>Canary</Cell>}
                cell={<DeploymentDistributionCell data={deployments} type="canary" />}
                width={150}
              />
              <Column
                header={<Cell>Roll out</Cell>}
                cell={<DeploymentDistributionCell data={deployments} type="healthy" />}
                width={150}
              />
              <Column
                header={<Cell>Placement</Cell>}
                cell={<DeploymentDistributionCell data={deployments} type="total" />}
                width={150}
              />
              <Column
                header={<Cell>Description</Cell>}
                cell={<TextCell data={deployments} col="StatusDescription" />}
                flexGrow={2}
                width={250}
              />
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

DeploymentList.defaultProps = {
  deployments: [],
  nested: false,
  showJob: true
}

DeploymentList.propTypes = {
  deployments: PropTypes.array.isRequired,
  nested: PropTypes.bool.isRequired,
  showJob: PropTypes.bool
}

export default DeploymentList
