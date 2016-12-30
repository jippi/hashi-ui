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
  WATCH_CONSUL_SERVICES, UNWATCH_CONSUL_SERVICES,
  WATCH_CONSUL_SERVICE, UNWATCH_CONSUL_SERVICE,
} from '../sagas/event'

class ConsulServices extends Component {

  constructor (props) {
    super(props)
    this._onClickService = this.monitorService.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: WATCH_CONSUL_SERVICES })

    if (this.props.routeParams.name) {
      this.props.dispatch({ type: WATCH_CONSUL_SERVICE, payload: this.props.routeParams.name })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_CONSUL_SERVICES })

    if (this.props.routeParams.name) {
      this.props.dispatch({ type: UNWATCH_CONSUL_SERVICE, payload: this.props.routeParams.name })
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.routeParams.name) {
      if (prevProps.routeParams.name) {
        this.props.dispatch({ type: UNWATCH_CONSUL_SERVICE, payload: prevProps.routeParams.name })
      }
      return;
    }

    if (prevProps.routeParams.name == this.props.routeParams.name) {
      return;
    }

    if (prevProps.routeParams.name) {
      this.props.dispatch({ type: UNWATCH_CONSUL_SERVICE, payload: prevProps.routeParams.name })
    }

    this.props.dispatch({ type: WATCH_CONSUL_SERVICE, payload: this.props.routeParams.name })
  }

  monitorService(name) {
    // this.props.dispatch({ type: WATCH_CONSUL_SERVICE, payload: name })
    this.props.router.push({ pathname: `/consul/${this.props.router.params.region}/services/${name}` })
  }

  getConsulService() {
    return this.props.consulService
  }

  render() {
    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='navigation-pane' xs={ 6 } sm={ 6 } md={ 4 } lg={ 4 }>
            <Subheader>Available Services</Subheader>
            <Paper>
              <List>
                {
                  this.props.consulServices.map(service => {
                    let icon = undefined

                    if (service.ChecksCritical) {
                      icon = <FontIcon color={ red800 } className='material-icons'>error</FontIcon>
                    } else if (service.ChecksWarning) {
                      icon = <FontIcon color={ orange800 } className='material-icons'>warning</FontIcon>
                    } else {
                      icon = <FontIcon color={ green800 } className='material-icons'>check</FontIcon>
                    }

                    let secondaryText = `Passing: ${service.ChecksPassing}`
                    secondaryText += ` / Warning: ${service.ChecksWarning}`
                    secondaryText += ` / Critical: ${service.ChecksCritical}`
                    secondaryText += ` @ ${new Set(service.Nodes).size} nodes`

                    return (
                      <ListItem
                        onTouchTap={ () => this._onClickService(service.Name) }
                        primaryText={ service.Name }
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
              { this.props.routeParams.name ? this.props.routeParams.name : 'Please select a service to the left' }
            </Subheader>

            { this.getConsulService().map((entry, index) => {

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
                      <strong>CheckID:</strong>
                      <br />
                      <div className='content-file small'>
                        { check.CheckID }
                      </div>

                      <br />

                      <strong>Output:</strong>
                      <br />
                      <div className='content-file small'>
                        { check.Output ? check.Output.trim() : '- no output -' }
                      </div>
                    </CardText>
                  </Card>
                )
              })

              let secondaryText = `Passing: ${counters.passing}`
              secondaryText += ` / Warning: ${counters.warning}`
              secondaryText += ` / Critical: ${counters.critical}`

              if (entry.Service.Tags && entry.Service.Tags.length > 0) {
                secondaryText += ` | Tags: ${entry.Service.Tags.join(", ")}`
              }

              return (
                <Card style={{ marginTop: index > 0 ? '1em' : 0 }}>
                  <CardHeader title={ `${entry.Node.Node} - ${entry.Service.ID}` } subtitle={ secondaryText } />
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

function mapStateToProps ({ consulServices, consulService }) {
  return { consulServices, consulService }
}

ConsulServices.defaultProps = {
  consulServices: [],
  ConsulService: [],
}

ConsulServices.propTypes = {
  dispatch: PropTypes.func.isRequired,
  consulServices: PropTypes.array.isRequired,
  consulService: PropTypes.array.isRequired,
  router: PropTypes.object.isRequired,
  routeParams: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(withRouter(ConsulServices))
