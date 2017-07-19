import React, { Component, PropTypes } from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { List, ListItem } from "material-ui/List"
import { Card, CardHeader, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import FontIcon from "material-ui/FontIcon"
import Subheader from "material-ui/Subheader"
import Paper from "material-ui/Paper"
import { red500, green500, orange500 } from "material-ui/styles/colors"
import RaisedButton from "material-ui/RaisedButton"
import {
  WATCH_CONSUL_NODES,
  UNWATCH_CONSUL_NODES,
  WATCH_CONSUL_NODE,
  UNWATCH_CONSUL_NODE,
  DEREGISTER_CONSUL_SERVICE_CHECK,
  DEREGISTER_CONSUL_SERVICE,
} from "../sagas/event"

class ConsulNodes extends Component {
  constructor(props) {
    super(props)
    this._onClickNode = this.monitorNode.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: WATCH_CONSUL_NODES })

    if (this.props.routeParams.name) {
      this.props.dispatch({
        type: WATCH_CONSUL_NODE,
        payload: this.props.routeParams.name,
      })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_CONSUL_NODES })

    if (this.props.routeParams.name) {
      this.props.dispatch({
        type: UNWATCH_CONSUL_NODE,
        payload: this.props.routeParams.name,
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.routeParams.name) {
      if (prevProps.routeParams.name) {
        this.props.dispatch({
          type: UNWATCH_CONSUL_NODE,
          payload: prevProps.routeParams.name,
        })
      }
      return
    }

    if (prevProps.routeParams.name == this.props.routeParams.name) {
      return
    }

    if (prevProps.routeParams.name) {
      this.props.dispatch({
        type: UNWATCH_CONSUL_NODE,
        payload: prevProps.routeParams.name,
      })
    }

    this.props.dispatch({
      type: WATCH_CONSUL_NODE,
      payload: this.props.routeParams.name,
    })
  }

  monitorNode(name) {
    this.props.router.push({
      pathname: `/consul/${this.props.router.params.region}/nodes/${name}`,
    })
    window.scrollTo(0, document.getElementById("value-pane").offsetTop)
  }

  deregisterServiceCheck(nodeAddress, checkID) {
    this.props.dispatch({
      type: DEREGISTER_CONSUL_SERVICE_CHECK,
      payload: { nodeAddress, checkID },
    })
  }

  deregisterService(nodeAddress, serviceID) {
    this.props.dispatch({
      type: DEREGISTER_CONSUL_SERVICE,
      payload: { nodeAddress, serviceID },
    })
  }

  getServices() {
    if (this.props.consulNode.Node === undefined) {
      return []
    }

    return this.props.consulNode.Services
  }

  getServiceChecks(serviceId) {
    if (this.props.consulNode.Node === undefined) {
      return []
    }

    return this.props.consulNode.Checks.filter(check => serviceId == check.ServiceID)
  }

  getStandaloneChecks() {
    if (this.props.consulNode.Node === undefined) {
      return []
    }

    const services = this.props.consulNode.Services.map(service => service.Service)
    return this.props.consulNode.Checks.filter(check => services.indexOf(check.ServiceName) === -1)
  }

  render() {
    let listStyle = {}
    let services = this.getServices()
    let buttonOffset = 10

    if (window.innerWidth < 1024) {
      buttonOffset = 5
      listStyle = { maxHeight: 200, overflow: "scroll" }
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="navigation-pane" xs={12} sm={12} md={4} lg={4}>
            <Subheader>Available Nodes</Subheader>
            <Paper>
              <List style={listStyle}>
                {this.props.consulNodes.map(node => {
                  let icon = undefined

                  const counters = {
                    passing: 0,
                    warning: 0,
                    critical: 0,
                  }

                  node.Checks.map(check => {
                    counters[check.Status]++
                  })

                  if (counters.critical) {
                    icon = (
                      <FontIcon color={red500} className="material-icons">
                        error
                      </FontIcon>
                    )
                  } else if (counters.warning) {
                    icon = (
                      <FontIcon color={orange500} className="material-icons">
                        warning
                      </FontIcon>
                    )
                  } else {
                    icon = (
                      <FontIcon color={green500} className="material-icons">
                        check
                      </FontIcon>
                    )
                  }

                  let secondaryText = `Passing: ${counters.passing}`
                  secondaryText += ` / Warning: ${counters.warning}`
                  secondaryText += ` / Critical: ${counters.critical}`

                  return (
                    <ListItem
                      onTouchTap={() => this._onClickNode(node.Node)}
                      primaryText={node.Node}
                      secondaryText={secondaryText}
                      leftIcon={icon}
                    />
                  )
                })}
              </List>
            </Paper>
          </Col>
          <Col id="value-pane" key="value-pane" xs={12} sm={12} md={8} lg={8}>
            <Subheader>
              {this.props.consulNode.Node
                ? `Node: ${this.props.consulNode.Node} | IP: ${this.props.consulNode.Address}`
                : "Please select a node"}
            </Subheader>

            {services.map((entry, index) => {
              const counters = {
                passing: 0,
                warning: 0,
                critical: 0,
              }

              const checks = this.getServiceChecks(entry.ID).map(check => {
                counters[check.Status]++

                let icon = undefined

                if (check.Status === "critical") {
                  icon = (
                    <FontIcon color={red500} className="material-icons">
                      error
                    </FontIcon>
                  )
                } else if (check.Status === "warning") {
                  icon = (
                    <FontIcon color={orange500} className="material-icons">
                      warning
                    </FontIcon>
                  )
                } else {
                  icon = (
                    <FontIcon color={green500} className="material-icons">
                      check
                    </FontIcon>
                  )
                }

                return (
                  <Card>
                    <CardHeader
                      title={`${check.Name} ${check.Notes ? " | " + check.Notes : ""}`}
                      avatar={icon}
                      actAsExpander
                      showExpandableButton
                    />
                    <CardText expandable>
                      <strong>CheckID:</strong>
                      <br />
                      <div className="content-file small">
                        {check.CheckID}
                      </div>

                      <br />

                      <strong>Output:</strong>
                      <br />
                      <div className="content-file small">
                        {check.Output ? check.Output.trim() : "- no output -"}
                      </div>

                      <br />

                      <RaisedButton
                        label="Deregister"
                        labelColor="white"
                        backgroundColor={red500}
                        style={{ marginRight: 12 }}
                        onClick={() => {
                          this.deregisterServiceCheck(this.props.consulNode.Address, check.CheckID)
                        }}
                      />

                    </CardText>
                  </Card>
                )
              })

              let secondaryText = `Passing: ${counters.passing}`
              secondaryText += ` / Warning: ${counters.warning}`
              secondaryText += ` / Critical: ${counters.critical}`
              secondaryText += ` / ID: ${entry.ID}`

              if (entry.Tags && entry.Tags.length > 0) {
                secondaryText += ` | Tags: ${entry.Tags.join(", ")}`
              }

              return (
                <Card style={{ marginTop: index > 0 ? "1em" : 0 }}>
                  <div
                    style={{
                      float: "right",
                      marginTop: buttonOffset,
                      clear: "both",
                    }}
                  >
                    <RaisedButton
                      label="Deregister"
                      labelColor="white"
                      backgroundColor={red500}
                      style={{ marginRight: 12 }}
                      onClick={() => {
                        this.deregisterService(this.props.consulNode.Address, entry.ID)
                      }}
                    />
                  </div>
                  <CardHeader title={`Service: ${entry.Service}`} subtitle={secondaryText} />
                  <CardText>
                    {checks}
                  </CardText>
                </Card>
              )
            })}

            {services.length > 0 ? <div style={{ marginTop: "1em" }} /> : null}

            {this.getStandaloneChecks().map(check => {
              let icon

              if (check.Status === "critical") {
                icon = (
                  <FontIcon color={red500} className="material-icons">
                    error
                  </FontIcon>
                )
              } else if (check.Status === "warning") {
                icon = (
                  <FontIcon color={orange500} className="material-icons">
                    warning
                  </FontIcon>
                )
              } else {
                icon = (
                  <FontIcon color={green500} className="material-icons">
                    check
                  </FontIcon>
                )
              }

              return (
                <Card>
                  <CardHeader
                    title={`Check: ${check.Name} ${check.Notes ? " | " + check.Notes : ""}`}
                    avatar={icon}
                    actAsExpander
                    showExpandableButton
                  />
                  <CardText expandable>
                    <strong>CheckID:</strong>
                    <br />
                    <div className="content-file small">
                      {check.CheckID}
                    </div>

                    <br />

                    <strong>Output:</strong>
                    <br />
                    <div className="content-file small">
                      {check.Output ? check.Output.trim() : "- no output -"}
                    </div>

                    <br />

                    <RaisedButton
                      label="Deregister"
                      labelColor="white"
                      backgroundColor={red500}
                      style={{ marginRight: 12 }}
                      onClick={() => {
                        this.deregisterServiceCheck(this.props.consulNode.Address, check.CheckID)
                      }}
                    />

                  </CardText>
                </Card>
              )
            })}
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps({ consulNodes, consulNode }) {
  return { consulNodes, consulNode }
}

ConsulNodes.defaultProps = {
  consulNodes: [],
  consulNode: {},
}

ConsulNodes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  consulNodes: PropTypes.array.isRequired,
  consulNode: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  routeParams: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(withRouter(ConsulNodes))
