import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Tabs from '../components/Tabs/Tabs';
import { WATCH_EVAL, UNWATCH_EVAL } from '../sagas/event';

class Evaluation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: 'Info',
                    path: 'info',
                },
                {
                    name: 'Allocations',
                    path: 'allocations',
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
            type: WATCH_EVAL,
            payload: this.props.params.evalId,
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_EVAL,
            payload: this.props.params.evalId,
        });
    }

    render() {
        if (this.props.evaluation == null) return (null);

        const path = this.props.location.pathname;
        const tabSlug = path.split('/').pop();
        const basePath = path.substring(0, path.lastIndexOf('/'));

        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Evaluation: { this.props.evaluation.ID }</h4>
                </div>
                <div className="tab-content">
                  <Tabs tabs={ this.state.tabs } tabSlug={ tabSlug } basePath={ basePath }>
                    { this.props.children }
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ evaluation }) {
    return { evaluation };
}

Evaluation.propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    evaluation: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Evaluation);
