import FontIcon from 'material-ui/FontIcon'
import React, { PureComponent, PropTypes } from 'react'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import { withRouter } from 'react-router'

const infoIcon = <FontIcon className='material-icons'>info_outline</FontIcon>
const allocationIcon = <FontIcon className='material-icons'>apps</FontIcon>
const evaluationIcon = <FontIcon className='material-icons'>share</FontIcon>
const taskGroupIcon = <FontIcon className='material-icons'>layers</FontIcon>
const rawIcon = <FontIcon className='material-icons'>code</FontIcon>

class _JobTopbar extends PureComponent {

  handleActive (tab) {
    let path = location.pathname.split('/')
    path.pop()
    path = path.join('/')
    this.props.router.push(path + '/' + tab)
  }

  getActiveTab () {
    const location = this.props.location
    const end = location.pathname.split('/').pop()

    if (end.startsWith('info')) {
      return 0
    }

    if (end.startsWith('allocations')) {
      return 1
    }

    if (end.startsWith('evaluations')) {
      return 2
    }

    if (end.startsWith('taskGroups')) {
      return 3
    }

    if (end.startsWith('raw')) {
      return 4
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
          label='Allocations'
          icon={ allocationIcon }
          onTouchTap={ () => this.handleActive('allocations') }
        />
        <BottomNavigationItem
          label='Evaluations'
          icon={ evaluationIcon }
          onTouchTap={ () => this.handleActive('evaluations') }
        />
        <BottomNavigationItem
          label='Task Groups'
          icon={ taskGroupIcon }
          onTouchTap={ () => this.handleActive('taskGroups') }
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

_JobTopbar.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
}

const ViewJobTopbar = withRouter(_JobTopbar)

export default ViewJobTopbar
