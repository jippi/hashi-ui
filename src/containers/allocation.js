import React, { Component } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs'

import { FETCH_ALLOC, STOP_WATCHING_ALLOC } from '../sagas/allocation';

class Allocation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info'
                },
                {
                    name: 'Files',
                    path: 'files'
                },
                {
                    name: 'Raw',
                    path: 'raw'
                }
            ]
        }
    }

    componentWillMount() {
        this.props.dispatch({
            type: FETCH_ALLOC,
            id: this.props.params['allocId']
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: STOP_WATCHING_ALLOC,
            id: this.props.params['allocId']
        });
    }

    render() {
        const path = this.props.location.pathname
        const tabSlug = path.split('/').pop()
        const basePath = path.substring(0, path.lastIndexOf("/"))

        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Allocation: {this.props.allocation.ID}</h4>
                        </div>
                        <div className="content">
                            <Tabs children={this.props.children} tabs={this.state.tabs} tabSlug={tabSlug} basePath={basePath} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation }) {
    return { allocation }
}

export default connect(mapStateToProps)(Allocation)
