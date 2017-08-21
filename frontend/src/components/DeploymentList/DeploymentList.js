import React, { Component } from "react"
import PropTypes from "prop-types"
import { Table, Column, Cell } from "fixed-data-table-2"
import { Card, CardText } from "material-ui/Card"
import DeploymentLink from "../DeploymentLink/DeploymentLink"
import JobLink from "../JobLink/JobLink"
import DeploymentDistribution from "../DeploymentDistribution/DeploymentDistribution"

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

  render() {
    const deployments = this.props.deployments
    const width = this.state.width - 240
    let height = this.state.height - 90

    if (this.props.nested) {
      height = height - 120
    }

    if (height < 300) {
      height = 300
    }

    return (
      <Card>
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
            <Column header={<Cell>Job</Cell>} cell={<JobLinkCell data={deployments} />} flexGrow={2} width={100} />
            <Column header={<Cell>Version</Cell>} cell={<TextCell data={deployments} col="JobVersion" />} width={100} />
            <Column header={<Cell>Status</Cell>} cell={<TextCell data={deployments} col="Status" />} width={150} />
            <Column
              header={<Cell>Canary</Cell>}
              cell={<DeploymentDistributionCell data={deployments} type="canary" />}
              width={150}
            />
            <Column
              header={<Cell>Healthy</Cell>}
              cell={<DeploymentDistributionCell data={deployments} type="healthy" />}
              width={150}
            />
            <Column
              header={<Cell>Total</Cell>}
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
    )
  }
}

DeploymentList.defaultProps = {
  deployments: [],
  nested: false
}

DeploymentList.propTypes = {
  deployments: PropTypes.array.isRequired,
  nested: PropTypes.bool.isRequired
}

export default DeploymentList
