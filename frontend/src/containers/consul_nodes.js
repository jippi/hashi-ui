import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { List, ListItem } from 'material-ui/List'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontIcon from 'material-ui/FontIcon'
import Subheader from 'material-ui/Subheader'
import Paper from 'material-ui/Paper'
import { red800, green800, orange800 } from 'material-ui/styles/colors'
import {
  WATCH_CONSUL_NODES, UNWATCH_CONSUL_NODES,
  WATCH_CONSUL_NODE, UNWATCH_CONSUL_NODE,
} from '../sagas/event'

class ConsulNodes extends Component {

  constructor (props) {
    super(props)
    this._onClickService = this.monitorNode.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: WATCH_CONSUL_NODES })

    if (this.props.routeParams.name) {
      this.props.dispatch({ type: WATCH_CONSUL_NODE, payload: this.props.routeParams.name })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_CONSUL_NODES })

    if (this.props.routeParams.name) {
      this.props.dispatch({ type: UNWATCH_CONSUL_NODE, payload: this.props.routeParams.name })
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.routeParams.name) {
      if (prevProps.routeParams.name) {
        this.props.dispatch({ type: UNWATCH_CONSUL_NODE, payload: prevProps.routeParams.name })
      }
      return;
    }

    if (prevProps.routeParams.name == this.props.routeParams.name) {
      return;
    }

    if (prevProps.routeParams.name) {
      this.props.dispatch({ type: UNWATCH_CONSUL_NODE, payload: prevProps.routeParams.name })
    }

    this.props.dispatch({ type: WATCH_CONSUL_NODE, payload: this.props.routeParams.name })
  }

  monitorNode(name) {
    this.props.router.push({ pathname: `/consul/${this.props.router.params.region}/nodes/${name}` })
  }

  render() {
    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='navigation-pane' xs={ 6 } sm={ 6 } md={ 4 } lg={ 4 }>
            <Subheader>Available Nodes</Subheader>
            <Paper>
              <List>
                {
                  this.props.consulNodes.map(node => {
                    let icon = undefined

                    const counters = {
                      passing : 0,
                      warning : 0,
                      critical: 0,
                    }

                    node.Checks.map(check => {
                      counters[check.Status]++
                    })

                    if (counters.critical) {
                      icon = <FontIcon color={ red800 } className='material-icons'>error</FontIcon>
                    } else if (counters.warning) {
                      icon = <FontIcon color={ orange800 } className='material-icons'>warning</FontIcon>
                    } else {
                      icon = <FontIcon color={ green800 } className='material-icons'>check</FontIcon>
                    }

                    let secondaryText = `Passing: ${counters.passing}`
                    secondaryText += ` / Warning: ${counters.warning}`
                    secondaryText += ` / Critical: ${counters.critical}`

                    return (
                      <ListItem
                        onTouchTap={ () => this._onClickService(node.Node) }
                        primaryText={ node.Node }
                        secondaryText={ secondaryText }
                        leftIcon={ icon  }
                      />
                    )
                  })
                }
              </List>
            </Paper>
          </Col>
          <Col key='value-pane' xs={ 6 } sm={ 6 } md={ 8 } lg={ 8 }>
            <Subheader>
              { this.props.routeParams.name ? this.props.routeParams.name : 'Please select a node to the left' }
            </Subheader>

            { this.props.consulService.map((entry, index) => {

              const counters = {
                passing : 0,
                warning : 0,
                critical: 0,
              }

              const checks = entry.Checks.map(check => {
                counters[check.Status]++

                let icon = undefined

                if (check.Status === 'critical') {
                  icon = <FontIcon color={ red800 } className='material-icons'>error</FontIcon>
                } else if (check.Status === 'warning') {
                  icon = <FontIcon color={ orange800 } className='material-icons'>warning</FontIcon>
                } else {
                  icon = <FontIcon color={ green800 } className='material-icons'>check</FontIcon>
                }

                return (
                  <Card>
                    <CardHeader
                      title={ `${check.Name} ${check.Notes ? (' | ' + check.Notes) : '' }` }
//                    subtitle={ `Status: ${check.Status}` }
                      avatar={ icon }
                      actAsExpander
                      showExpandableButton
                    />
                    <CardText expandable>
                      <strong>Output:</strong>
                      <br />
                      <div className='content-file small'>
                        { check.Output ? check.Output.trim() : '- no output -' }
                      </div>

                      <br />

                      <strong>CheckID:</strong>
                      <br />
                      <div className='content-file small'>
                        { check.CheckID }
                      </div>
                    </CardText>
                  </Card>
                )
              })

              let secondaryText = `Passing: ${counters.passing}`
              secondaryText += ` / Warning: ${counters.warning}`
              secondaryText += ` / Critical: ${counters.critical}`
              secondaryText += ` | Tags: ${(entry.Service.Tags ? entry.Service.Tags : []).join(", ")}`;

              return (
                <Card style={{ marginTop: index > 0 ? '1em' : 0 }}>
                  <CardHeader title={ `${entry.Node.Node} (${entry.Node.Address})` } subtitle={ secondaryText } />
                  <CardText>
                    { checks }
                  </CardText>
                </Card>
              )
            }) }
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps ({ consulNodes, consulService }) {
  return { consulNodes, consulService }
}

ConsulNodes.defaultProps = {
  consulNodes: [],
  ConsulService: [],
}

ConsulNodes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  consulNodes: PropTypes.array.isRequired,
  consulService: PropTypes.array.isRequired,
  router: PropTypes.object.isRequired,
  routeParams: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(withRouter(ConsulNodes))
