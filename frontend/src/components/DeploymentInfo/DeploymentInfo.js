import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Card, CardTitle, CardText } from "material-ui/Card"
import JobLink from "../JobLink/JobLink"
import TableHelper from "../TableHelper/TableHelper"
import MetaPayload from "../MetaPayload/MetaPayload"
import ConstraintTable from "../ConstraintTable/ConstraintTable"
import JobTaskGroupActionScale from "../JobTaskGroupActionScale/JobTaskGroupActionScale"
import JobTaskGroupActionStop from "../JobTaskGroupActionStop/JobTaskGroupActionStop"
import { TableRow, TableRowColumn } from "../Table"

const deploymentProps = ["ID", "JobVersion", "Status", "StatusDescription"]

class DeploymentInfo extends Component {
  render() {
    if (this.props.deployment.ID == null) {
      return <div>Loading deployment ...</div>
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="properties-pane" xs={12} sm={12} md={6} lg={6}>
            <Card>
              <CardTitle title="Job Properties" />
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
