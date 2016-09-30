import React from 'react';
import { Link } from 'react-router';

const Sidebar = ({ location }) => {
    return (
        <div className="sidebar" data-color="nomad-green" data-image="assets/img/nomad.jpg">
            <div className="sidebar-wrapper">
                <div className="logo">
                    <Link to={{ pathname: '/cluster' }} className="logo-text" >
                        Nomad
                    </Link>
                </div>
                <ul className="nav">
                    <li className={location.pathname.startsWith('/cluster') ? 'active' : ''}>
                        <Link to={{ pathname: '/cluster' }}>
                            <i className="pe-7s-cloud" />
                            <p>Cluster</p>
                        </Link>
                    </li>
                    <li className={location.pathname.startsWith('/jobs') ? 'active' : ''}>
                        <Link to={{ pathname: '/jobs' }}>
                            <i className="pe-7s-copy-file" />
                            <p>Jobs</p>
                        </Link>
                    </li>
                    <li className={location.pathname.startsWith('/allocations') ? 'active' : ''}>
                        <Link to={{ pathname: '/allocations' }}>
                            <i className="pe-7s-graph" />
                            <p>Allocations</p>
                        </Link>
                    </li>
                    <li className={location.pathname.startsWith('/evaluations') ? 'active' : ''}>
                        <Link to={{ pathname: '/evaluations' }}>
                            <i className="pe-7s-gleam" />
                            <p>Evaluations</p>
                        </Link>
                    </li>
                    <li className={location.pathname.startsWith('/members') ? 'active' : ''}>
                        <Link to={{ pathname: '/members' }}>
                            <i className="pe-7s-share" />
                            <p>Members</p>
                        </Link>
                    </li>
                    <li className={location.pathname.startsWith('/nodes') ? 'active' : ''}>
                        <Link to={{ pathname: '/nodes' }}>
                            <i className="pe-7s-keypad" />
                            <p>Nodes</p>
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="sidebar-background"></div>
        </div>
    );
};

export default Sidebar;
