import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs';

import { WATCH_NODE, UNWATCH_NODE } from '../sagas/event';

class Client extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info',
                },
                {
                    name: 'Raw',
                    path: 'raw',
                },
            ],
        };
    }

    componentWillMount() {
        this.props.dispatch({
            type: WATCH_NODE,
            payload: this.props.params.nodeId,
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_NODE,
            payload: this.props.params.nodeId,
        });
    }

    render() {
        if (this.props.node == null) return (null);

        const path = this.props.location.pathname;
        const tabSlug = path.split('/').pop();
        const basePath = path.substring(0, path.lastIndexOf('/'));

        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Client: {this.props.node.Name}</h4>
                </div>
                <div className="content">
                  <Tabs tabs={ this.state.tabs } tabSlug={ tabSlug } basePath={ basePath }>
                    {this.props.children}
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ node }) {
    return { node };
}

Client.propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Client);
