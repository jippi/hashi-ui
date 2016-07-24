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
                    <li className={location.pathname === '/cluster' ? 'active' : ''}>
                        <Link to={{ pathname: '/cluster' }}>
                            <i className="pe-7s-cloud" />
                            <p>Cluster</p>
                        </Link>
                    </li>
                    <li className={location.pathname === '/jobs' ? 'active' : ''}>
                        <Link to={{ pathname: '/jobs' }}>
                            <i className="pe-7s-menu" />
                            <p>Jobs</p>
                        </Link>
                    </li>
                    <li className={location.pathname === '/nodes' ? 'active' : ''}>
                        <Link to={{ pathname: '/nodes' }}>
                            <i className="pe-7s-network" />
                            <p>Nodes</p>
                        </Link>
                    </li>
                    <li className={location.pathname === '/allocations' ? 'active' : ''}>
                        <Link to={{ pathname: '/allocations' }}>
                            <i className="pe-7s-news-paper" />
                            <p>Allocations</p>
                        </Link>
                    </li>
                    <li className={location.pathname === '/evaluations' ? 'active' : ''}>
                        <Link to={{ pathname: '/evaluations' }}>
                            <i className="pe-7s-science" />
                            <p>Evaluations</p>
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="sidebar-background"></div>
        </div>
    );
};

export default Sidebar;
