import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Sidebar = ({ location }) =>
  <div className="col-sm-3 col-md-2 sidebar" data-color="nomad-green">
    <div className="logo">
      <Link to={{ pathname: '/cluster' }} className="logo-text" >
        Nomad
      </Link>
    </div>
    <div className="sidebar-wrapper">
      <ul className="nav">
        <li className={ location.pathname.startsWith('/cluster') ? 'active' : '' }>
          <Link to={{ pathname: '/cluster' }}>
            <i className="pe-7s-cloud" />
            <p>Cluster</p>
          </Link>
        </li>
        <li className={ location.pathname.startsWith('/jobs') ? 'active' : '' }>
          <Link to={{ pathname: '/jobs' }}>
            <i className="pe-7s-copy-file" />
            <p>Jobs</p>
          </Link>
        </li>
        <li className={ location.pathname.startsWith('/allocations') ? 'active' : '' }>
          <Link to={{ pathname: '/allocations' }}>
            <i className="pe-7s-graph" />
            <p>Allocations</p>
          </Link>
        </li>
        <li className={ location.pathname.startsWith('/evaluations') ? 'active' : '' }>
          <Link to={{ pathname: '/evaluations' }}>
            <i className="pe-7s-gleam" />
            <p>Evaluations</p>
          </Link>
        </li>
        <li className={ location.pathname.startsWith('/clients') ? 'active' : '' }>
          <Link to={{ pathname: '/clients' }}>
            <i className="pe-7s-keypad" />
            <p>Clients</p>
          </Link>
        </li>
        <li className={ location.pathname.startsWith('/servers') ? 'active' : '' }>
          <Link to={{ pathname: '/servers' }}>
            <i className="pe-7s-share" />
            <p>Servers</p>
          </Link>
        </li>
      </ul>
    </div>
    <div className="sidebar-background"></div>
  </div>;

Sidebar.propTypes = {
    location: PropTypes.object.isRequired,
};

export default Sidebar;
