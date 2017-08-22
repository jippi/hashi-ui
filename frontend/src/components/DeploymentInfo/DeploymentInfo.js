import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { Table, Column, Cell } from "fixed-data-table-2"
import JobLink from "../JobLink/JobLink"
import TableHelper from "../TableHelper/TableHelper"
import MetaPayload from "../MetaPayload/MetaPayload"
import ConstraintTable from "../ConstraintTable/ConstraintTable"
import JobTaskGroupActionScale from "../JobTaskGroupActionScale/JobTaskGroupActionScale"
import JobTaskGroupActionStop from "../JobTaskGroupActionStop/JobTaskGroupActionStop"
import { TableRow, TableRowColumn } from "../Table"
import DeploymentDistribution from "../DeploymentDistribution/DeploymentDistribution"

const deploymentProps = ["ID", "JobVersion", "Status", "StatusDescription"]

const TextCell = ({ rowIndex, data, col, ...props }) =>
  <Cell {...props}>
    {data[rowIndex][col]}
  </Cell>

const DeploymentDistributionCell = ({ rowIndex, data, type, ...props }) =>
  <Cell {...props}>
    <DeploymentDistribution deployment={data[rowIndex]} type={type} />
  </Cell>

class DeploymentInfo extends Component {
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
    if (this.props.deployment.ID == null) {
      return <div>Loading deployment ...</div>
    }

    let groups = Object.keys(this.props.deployment.TaskGroups).map(key => {
      return {
        Name: key,
        TaskGroups: {
          someIrrelevantName: this.props.deployment.TaskGroups[key]
        }
      }
    })

    const width = this.state.width - 270

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="properties-pane" xs={12} sm={12} md={6} lg={6}>
            <Card>
              <CardTitle title="Deployment Properties" />
              <CardText>
                <dl className="dl-horizontal">
                  {deploymentProps.map(deploymentProp => {
                    let deploymentPropValue = this.props.deployment[deploymentProp]
                    if (Array.isArray(deploymentPropValue)) {
                      deploymentPropValue = deploymentPropValue.join(", ")
                    }

                    const result = []
                    result.push(
                      <dt>
                        {deploymentProp}
                      </dt>
                    )
                    result.push(
                      <dd>
                        {deploymentPropValue}
                      </dd>
                    )
                    return result
                  }, this)}
                </dl>
              </CardText>
            </Card>
          </Col>
          <Col key="action-pane" xs={12} sm={12} md={6} lg={6}>
            <Card>
              <CardTitle title="Actions" />
              <CardText>
                <ul>
                  <li>Promote</li>
                  <li>Pause</li>
                  <li>Fail</li>
                </ul>
              </CardText>
            </Card>
          </Col>
        </Row>

        <Row key="status" style={{ marginTop: "1rem" }}>
          <Col key="properties-pane" xs={12} sm={12} md={12} lg={12}>
            <Card>
              <CardTitle title="Deployment status" />
              <CardText>
                <Table
                  rowHeight={35}
                  headerHeight={35}
                  rowsCount={groups.length}
                  height={(groups.length + 3) * 35}
                  width={width}
                  touchScrollEnabled
                >
                  <Column
                    header={<Cell>Group</Cell>}
                    cell={<TextCell data={groups} col="Name" />}
                    width={150}
                    flexGrow={2}
                  />
                  <Column
                    header={<Cell>Canary</Cell>}
                    cell={<DeploymentDistributionCell data={groups} type="canary" />}
                    width={150}
                    flexGrow={2}
                  />
                  <Column
                    header={<Cell>Roll out</Cell>}
                    cell={<DeploymentDistributionCell data={groups} type="healthy" />}
                    width={150}
                    flexGrow={2}
                  />
                  <Column
                    header={<Cell>Placement</Cell>}
                    cell={<DeploymentDistributionCell data={groups} type="total" />}
                    width={150}
                    flexGrow={2}
                  />
                </Table>
              </CardText>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}

DeploymentInfo.defaultProps = {
  deployment: {},
  allocations: {},
  evaluations: {}
}

function mapStateToProps({ deployment }) {
  return { deployment }
}

DeploymentInfo.propTypes = {
  deployment: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(DeploymentInfo)
