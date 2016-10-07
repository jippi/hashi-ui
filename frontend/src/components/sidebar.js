import React, { PropTypes, PureComponent } from 'react';
import { Link } from 'react-router';

class Sidebar extends PureComponent {

    /* eslint class-methods-use-this: 0*/
    onClick() {
        window.document.querySelector('html').classList.toggle('sidebar-mini');
    }

    render() {
        return (
          <div className="sidebar">
            <div className="logo">
              <span className="logo-text">
                Nomad
                <span onClick={ this.onClick } className="expand-left-menu">
                  <i className="fa fa-minus visible-on-sidebar-regular pointer"></i>
                </span>
              </span>
            </div>
            <div onClick={ this.onClick } className="logo logo-mini pointer">
              <span className="logo-text">N</span>
              <i className="fa fa-plus expand-left-menu"></i>
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
          </div>
        );
    }
}

Sidebar.propTypes = {
    location: PropTypes.object.isRequired,
};

export default Sidebar;
