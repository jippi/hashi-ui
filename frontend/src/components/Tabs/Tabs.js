import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const Tabs = ({ children, tabs, tabSlug, basePath }) =>
  <div>
    <ul role='tablist' className='nav nav-tabs'>
      {tabs.map(tab =>
        <li key={ tab.name } role='presentation' className={ (tabSlug === tab.path) ? 'active' : null }>
          <Link
            to={{ pathname: `${basePath}/${tab.path}` }}
            data-toggle='tab'
            aria-expanded={ (tabSlug === tab.path) ? 'true' : 'false' }
          >
            { tab.name }
          </Link>
        </li>)
      }
    </ul>
    <div className='tab-content'>
      {children}
    </div>
  </div>

Tabs.propTypes = {
  tabs: PropTypes.array.isRequired,
  tabSlug: PropTypes.string.isRequired,
  basePath: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired
}

export default Tabs
