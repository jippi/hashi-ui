import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Tabs from '../components/tabs';

import { WATCH_MEMBER, UNWATCH_MEMBER } from '../sagas/event';

class Server extends Component {

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
            type: WATCH_MEMBER,
            payload: this.props.params.memberId,
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_MEMBER,
            payload: this.props.params.memberId,
        });
    }

    render() {
        if (this.props.member == null) return (null);

        const path = this.props.location.pathname;
        const tabSlug = path.split('/').pop();
        const basePath = path.substring(0, path.lastIndexOf('/'));

        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Server: {this.props.member.ID}</h4>
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

function mapStateToProps({ member }) {
    return { member };
}

Server.propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    member: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Server);
