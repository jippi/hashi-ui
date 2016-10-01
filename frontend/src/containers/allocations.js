import React, {  Component } from 'react';
import { connect } from 'react-redux';
import AllocationList from '../components/allocation_list'

class Allocations extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Allocations</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <AllocationList allocations={this.props.allocations} nodes={this.props.nodes} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocations, nodes }) {
    return { allocations, nodes }
}

export default connect(mapStateToProps)(Allocations)
