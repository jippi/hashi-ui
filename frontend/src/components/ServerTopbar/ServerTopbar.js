import FontIcon from 'material-ui/FontIcon'
import React, { PureComponent, PropTypes } from 'react'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import { withRouter } from 'react-router'

const infoIcon = <FontIcon className='material-icons'>info_outline</FontIcon>
const rawIcon = <FontIcon className='material-icons'>code</FontIcon>

class _ViewServerTopbar extends PureComponent {

  handleActive (tab) {
    const prefix = `/nomad/${this.props.router.params.region}/servers/${this.props.member.Name}`
    this.props.router.push(prefix + '/' + tab)
  }

  getActiveTab () {
    const location = this.props.location
    const end = location.pathname.split('/').pop()

    if (end.startsWith('info')) {
      return 0
    }

    if (end.startsWith('raw')) {
      return 1
    }

    return 0
  }

  getStyle () {
    return {
      borderBottom: '1px solid #e0e0e0',
      marginBottom: 10
    }
  }

  render () {
    return (
      <BottomNavigation selectedIndex={ this.getActiveTab() } style={ this.getStyle() }>
        <BottomNavigationItem
          label='Info'
          icon={ infoIcon }
          onTouchTap={ () => this.handleActive('info') }
        />
        <BottomNavigationItem
          label='Raw'
          icon={ rawIcon }
          onTouchTap={ () => this.handleActive('raw') }
        />
      </BottomNavigation>
    )
  }
}

_ViewServerTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired
}

const ViewServerTopbar = withRouter(_ViewServerTopbar)

export default ViewServerTopbar
