import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs';

import { WATCH_ALLOC, UNWATCH_ALLOC } from '../sagas/event';

class Allocation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info',
                },
                {
                    name: 'Files',
                    path: 'files',
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
            type: WATCH_ALLOC,
            payload: this.props.params.allocId,
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_ALLOC,
            payload: this.props.params.allocId,
        });
    }

    render() {
        if (this.props.allocation == null) return (null);

        const path = this.props.location.pathname;
        const tabSlug = path.split('/').pop();
        const basePath = path.substring(0, path.lastIndexOf('/'));

        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">
                    Allocation: {this.props.allocation.ID}
                  </h4>
                </div>
                <div className="content">
                  <Tabs
                    tabs={ this.state.tabs }
                    tabSlug={ tabSlug }
                    basePath={ basePath }
                  >
                    {this.props.children}
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ allocation }) {
    return { allocation };
}

Allocation.propTypes = {
    dispatch: PropTypes.func,
    params: PropTypes.isRequired,
    allocation: PropTypes.isRequired,
    location: PropTypes.isRequired,
    children: PropTypes.isRequired,
};

export default connect(mapStateToProps)(Allocation);
