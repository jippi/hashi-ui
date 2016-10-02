import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Tabs = ({ tabs, tabSlug, basePath }) =>
  <div>
    <ul role="tablist" className="nav nav-tabs">
      {tabs.map(tab =>
        <li key={ tab.name } role="presentation" className={ (tabSlug === tab.path) ? 'active' : null }>
          <Link
            to={{ pathname: `${basePath}/${tab.path}` }}
            data-toggle="tab"
            aria-expanded={ (tabSlug === tab.path) ? 'true' : 'false' }
          >
            { tab.name }
          </Link>
        </li>)
      }, this)
    </ul>
    <div className="tab-content">
      {this.props.children}
    </div>
  </div>;

Tabs.propTypes = {
    tabs: PropTypes.isRequired,
    tabSlug: PropTypes.isRequired,
    basePath: PropTypes.isRequired,
};

export default Tabs;
