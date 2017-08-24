import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import { green500 } from "material-ui/styles/colors"
import FontIcon from "material-ui/FontIcon"
import { NOMAD_FORCE_GC, NOMAD_RECONCILE_SYSTEM } from "../sagas/event"

class System extends Component {
  gc() {
    this.props.dispatch({ type: NOMAD_FORCE_GC })
  }

  reconcile() {
    this.props.dispatch({ type: NOMAD_RECONCILE_SYSTEM })
  }

  render() {
    return (
      <div>
        <h3 style={{ marginTop: "10px" }}>System tasks</h3>

        <Grid fluid style={{ padding: 0 }}>
          <Row style={{ marginTop: "1rem" }}>
            <Col key="gc-pane" xs={2} sm={2} md={2} lg={2}>
              <Card>
                <CardTitle title="Force GC" style={{ textAlign: "center" }} />
                <CardText style={{ textAlign: "center" }}>
                  <FontIcon
                    className="material-icons"
                    color={green500}
                    style={{ fontSize: 50, cursor: "pointer" }}
                    onClick={() => this.gc()}
                  >
                    delete
                  </FontIcon>
                </CardText>
              </Card>
            </Col>
            <Col key="reconcile-summaries-pane" xs={2} sm={2} md={2} lg={2}>
              <Card>
                <CardTitle title="Reconcile Summaries" style={{ textAlign: "center" }} />
                <CardText style={{ textAlign: "center" }}>
                  <FontIcon
                    className="material-icons"
                    color={green500}
                    style={{ fontSize: 50, cursor: "pointer" }}
                    onClick={() => this.reconcile()}
                  >
                    refresh
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
