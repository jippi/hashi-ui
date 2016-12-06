import React, { PureComponent, PropTypes } from 'react'
import AppBar from 'material-ui/AppBar'
import { withRouter } from 'react-router'
import {Tabs, Tab} from 'material-ui/Tabs'

class Topbar extends PureComponent {

  constructor () {
    super()
    this._onClick = this.handleActive.bind(this)
  }

  handleActive (tab) {
    this.props.router.push(tab.props['data-route'])
  }

  getActiveTab () {
    const location = this.props.location

    if (location.pathname.startsWith('/cluster')) {
      return 'cluster'
    }

    if (location.pathname.startsWith('/jobs')) {
      return 'jobs'
    }

    if (location.pathname.startsWith('/allocations')) {
      return 'allocations'
    }

    if (location.pathname.startsWith('/evaluations')) {
      return 'evaluations'
    }

    if (location.pathname.startsWith('/clients')) {
      return 'clients'
    }

    if (location.pathname.startsWith('/servers')) {
      return 'servers'
    }

    return 'cluster'
  }

  render () {
    return (
      <div>
        <AppBar title='Nomad UI' showMenuIconButton={ false } />
        <Tabs value={ this.getActiveTab() }>
          <Tab label='Cluster' value='cluster' data-route='/cluster' onActive={ this._onClick } />
          <Tab label='Jobs' value='jobs' data-route='/jobs' onActive={ this._onClick } />
          <Tab label='Allocations' value='allocations' data-route='/allocations' onActive={ this._onClick } />
          <Tab label='Evaluations' value='evaluations' data-route='/evaluations' onActive={ this._onClick } />
          <Tab label='Clients' value='clients' data-route='/clients' onActive={ this._onClick } />
          <Tab label='Servers' value='servers' data-route='/servers' onActive={ this._onClick } />
        </Tabs>
      </div>
    )
  }
}

Topbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
}

const TopbarWithRouter = withRouter(Topbar)

export default TopbarWithRouter
