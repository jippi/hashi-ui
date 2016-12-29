import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import AppBar from 'material-ui/AppBar'
import { withRouter } from 'react-router'
import { Tab, Tabs } from 'react-toolbox/lib/tabs';
import theme from './AppTopbar.scss';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon'
import { FETCH_NOMAD_REGIONS, SET_NOMAD_REGION } from '../../sagas/event'

class AppTopbar extends PureComponent {

  componentWillMount () {
    this.props.dispatch({
      type: FETCH_NOMAD_REGIONS,
    })
  }

  constructor () {
    super()
    this._onClick = this.handleActive.bind(this)
    this._onChangeNomadRegion = this.handleChangeNomadRegion.bind(this)
  }

  handleChangeNomadRegion(region) {
    this.props.dispatch({
      type: SET_NOMAD_REGION,
      payload: region
    })
  }

  handleActive (index) {
    const prefix = `/nomad/${this.props.router.params.region}`
    let route = prefix

    switch (index) {
    case 0:
      route = `${prefix}/cluster`;
      break;

    case 1:
      route = `${prefix}/jobs`
      break;

    case 2:
      route = `${prefix}/allocations`
      break;

    case 3:
      route = `${prefix}/evaluations`
      break;

    case 4:
      route = `${prefix}/clients`
      break;

    case 5:
      route = `${prefix}/servers`
      break;

    default:
      route = `${prefix}/cluster`
    }

    this.props.router.push(route)
  }

  getActiveTab () {
    const location = this.props.location

    const prefix = `/nomad/${this.props.router.params.region}`

    if (location.pathname.startsWith(prefix + '/cluster')) {
      return 0
    }

    if (location.pathname.startsWith(prefix + '/jobs')) {
      return 1
    }

    if (location.pathname.startsWith(prefix + '/allocations')) {
      return 2
    }

    if (location.pathname.startsWith(prefix + '/evaluations')) {
      return 3
    }

    if (location.pathname.startsWith(prefix + '/clients')) {
      return 4
    }

    if (location.pathname.startsWith(prefix + '/servers')) {
      return 5
    }

    return 0
  }

  nomadRegions() {
    if (!Array.isArray(this.props.nomadRegions)) {
      return
    }

    return (
      <IconMenu
        iconButtonElement={ <IconButton><FontIcon className='material-icons'>public</FontIcon></IconButton> }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        { this.props.nomadRegions.map(region => {
          return <MenuItem primaryText={ region } onTouchTap={ () => this._onChangeNomadRegion(region) } />
        })}
      </IconMenu>
    )
  }

  tabs() {
    return (
      <Tabs index={ this.getActiveTab() } onChange={ this._onClick } theme={ theme } fixed>
        <Tab label='Cluster' value='cluster' data-route='/cluster' />
        <Tab label='Jobs' value='jobs' data-route='/jobs' />
        <Tab label='Allocations' value='allocations' data-route='/allocations' />
        <Tab label='Evaluations' value='evaluations' data-route='/evaluations' />
        <Tab label='Clients' value='clients' data-route='/clients' />
        <Tab label='Servers' value='servers' data-route='/servers' />
      </Tabs>
    )
  }

  title() {
    let title = 'Hashi UI'

    if (this.props.router.location.pathname.startsWith('/nomad')) {
      title = title + ' - Nomad'
    }

    if ('region' in this.props.router.params) {
      title = title + ' @ ' + this.props.router.params['region']
    }

    return title
  }

  render () {
    const tabs = 'region' in this.props.router.params ? this.tabs() : undefined
    return (
      <section style={{ backgroundColor: '#4b9a7d' }}>
        <AppBar title={ this.title() } showMenuIconButton={ false } iconElementRight={ this.nomadRegions() } />
        { tabs }
      </section>
    )
  }
}

AppTopbar.defaultProps = {
  nomadRegions: [],
}

AppTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  nomadRegions: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

function mapStateToProps ({ nomadRegions }) {
  return { nomadRegions }
}

export default connect(mapStateToProps)(withRouter(AppTopbar))