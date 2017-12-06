import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import { green500 } from "material-ui/styles/colors"
import FontIcon from "material-ui/FontIcon"
import { NOMAD_FORCE_GC, NOMAD_RECONCILE_SYSTEM, NOMAD_EVALUATE_ALL_JOBS } from "../sagas/event"

class System extends Component {
  gc() {
    this.props.dispatch({ type: NOMAD_FORCE_GC })
  }

  reconcile() {
    this.props.dispatch({ type: NOMAD_RECONCILE_SYSTEM })
  }

  evaluateAllJobs() {
    this.props.dispatch({ type: NOMAD_EVALUATE_ALL_JOBS })
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>System - Nomad - Hashi-UI</title>
        </Helmet>

        <h3 style={{ marginTop: "10px" }}>System tasks</h3>

        <Grid fluid style={{ padding: 0 }}>
          <Row style={{ marginTop: "1rem" }}>
            <Col key="gc-pane" xs={4} sm={4} md={4} lg={4}>
              <Card>
                <CardTitle title="Force GC" style={{ textAlign: "center" }} />
                <CardText style={{ textAlign: "center" }}>
                  <FontIcon
                    className="material-icons"
                    color={green500}
                    style={{ fontSize: 50, cursor: "pointer" }}
                    onClick={() => this.gc()}
                  >
                    cached
                  </FontIcon>
                </CardText>
              </Card>
            </Col>
            <Col key="reconcile-summaries-pane" xs={4} sm={4} md={4} lg={4}>
              <Card>
                <CardTitle title="Reconcile Summaries" style={{ textAlign: "center" }} />
                <CardText style={{ textAlign: "center" }}>
                  <FontIcon
                    className="material-icons"
                    color={green500}
                    style={{ fontSize: 50, cursor: "pointer" }}
                    onClick={() => this.reconcile()}
                  >
                    compare_arrows
                  </FontIcon>
                </CardText>
              </Card>
            </Col>
            <Col key="evaluate-all" xs={4} sm={4} md={4} lg={4}>
              <Card>
                <CardTitle title="Force evaluate system/service jobs" style={{ textAlign: "center" }} />
                <CardText style={{ textAlign: "center" }}>
                  <FontIcon
                    className="material-icons"
                    color={green500}
                    style={{ fontSize: 50, cursor: "pointer" }}
                    onClick={() => this.evaluateAllJobs()}
                  >
                    code
                  </FontIcon>
                </CardText>
              </Card>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

System.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect()(System)
