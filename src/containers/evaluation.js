import React, { Component } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs'

import { WATCH_EVAL, UNWATCH_EVAL } from '../sagas/event';

class Evaluation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info'
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
            type: WATCH_EVAL,
            payload: this.props.params['evalId']
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_EVAL,
            payload: this.props.params['evalId']
        });
    }

    render() {
        if (this.props.evaluation == null) return(null);

        const path = this.props.location.pathname
        const tabSlug = path.split('/').pop()
        const basePath = path.substring(0, path.lastIndexOf("/"))

        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Evaluation: {this.props.evaluation.ID}</h4>
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

function mapStateToProps({ evaluation }) {
    return { evaluation }
}

export default connect(mapStateToProps)(Evaluation)
