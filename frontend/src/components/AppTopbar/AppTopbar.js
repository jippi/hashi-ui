import React, { PureComponent, PropTypes } from 'react'
import AppBar from 'material-ui/AppBar'
import { withRouter } from 'react-router'
import { Tab, Tabs } from 'react-toolbox/lib/tabs';
import theme from './AppTopbar.scss';

class AppTopbar extends PureComponent {

  constructor () {
    super()
    this._onClick = this.handleActive.bind(this)
  }

  handleActive (index) {
    let route = '/nomad/cluster'

    switch (index) {
    case 0:
      route = '/nomad/cluster';
      break;

    case 1:
      route = '/nomad/jobs'
      break;

    case 2:
      route = '/nomad/allocations'
      break;

    case 3:
      route = '/nomad/evaluations'
      break;

    case 4:
      route = '/nomad/clients'
      break;

    case 5:
      route = '/nomad/servers'
      break;

    default:
      route = '/nomad/cluster'
    }

    this.props.router.push(route)
  }

  getActiveTab () {
    const location = this.props.location

    if (location.pathname.startsWith('/nomad/cluster')) {
      return 0
    }

    if (location.pathname.startsWith('/nomad/jobs')) {
      return 1
    }

    if (location.pathname.startsWith('/nomad/allocations')) {
      return 2
    }

    if (location.pathname.startsWith('/nomad/evaluations')) {
      return 3
    }

    if (location.pathname.startsWith('/nomad/clients')) {
      return 4
    }

    if (location.pathname.startsWith('/nomad/servers')) {
      return 5
    }

    return 0
  }

  render () {
    return (
      <section style={{ backgroundColor: '#4b9a7d' }}>
        <AppBar title='Hashi UI' showMenuIconButton={ false } />

        <Tabs index={ this.getActiveTab() } onChange={ this._onClick } theme={ theme } fixed>
          <Tab label='Cluster' value='cluster' data-route='/cluster' />
          <Tab label='Jobs' value='jobs' data-route='/jobs' />
          <Tab label='Allocations' value='allocations' data-route='/allocations' />
          <Tab label='Evaluations' value='evaluations' data-route='/evaluations' />
          <Tab label='Clients' value='clients' data-route='/clients' />
          <Tab label='Servers' value='servers' data-route='/servers' />
        </Tabs>
      </section>
    )
  }
}

AppTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
}

const AppTopbarWithRouter = withRouter(AppTopbar)

export default AppTopbarWithRouter
