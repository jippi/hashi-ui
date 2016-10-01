import React, { Component } from 'react';
import { Link } from 'react-router';

class Tabs extends Component {

    render() {
        return (
            <div>
                <ul role="tablist" className="nav nav-tabs">
                    {this.props.tabs.map((tab) => {
                        return (
                            <li key={tab.name} role="presentation" className={(this.props.tabSlug === tab.path) ? "active" : null }>
                                <Link to={{pathname: this.props.basePath + '/' + tab.path }} data-toggle="tab" aria-expanded={(this.props.tabSlug === tab.path) ? "true" : "false" }>{ tab.name }</Link>
                            </li>
                        );
                    }, this)}
                </ul>
                <div className="tab-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Tabs
