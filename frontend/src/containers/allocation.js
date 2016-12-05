import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ViewAllocationTopbar from '../components/ViewAllocationTopbar/ViewAllocationTopbar';
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
          name: 'Logs',
          path: 'logs',
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
      <div>
        <ViewAllocationTopbar { ...this.props } />

        <h2 style={{ padding: 10, paddingBottom: 0 }}>Allocation: { this.props.allocation.Name }</h2>

        <br />

        { this.props.children }
      </div>
    );
  }
}

function mapStateToProps({ allocation }) {
  return { allocation };
}

Allocation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Allocation);
