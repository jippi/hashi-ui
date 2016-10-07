import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../components/allocation/list';

class Allocations extends PureComponent {

    render() {
        return (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="header">
                  <h4 className="title">Allocations</h4>
                </div>
                <div className="content table-responsive table-full-width">
                  <AllocationList { ...this.props } allocations={ this.props.allocations } nodes={ this.props.nodes } />
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ allocations, nodes }) {
    return { allocations, nodes };
}

Allocations.propTypes = {
    allocations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(Allocations);
