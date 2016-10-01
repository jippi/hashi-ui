import React, { Component } from 'react';
import { connect } from 'react-redux';
import EvaluationList from '../components/evaluation_list';

class Evaluations extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="header">
                            <h4 className="title">Evaluations</h4>
                        </div>
                        <div className="content table-responsive table-full-width">
                            <EvaluationList evaluations={this.props.evaluations} nodes={this.props.nodes} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ evaluations, nodes }) {
    return { evaluations, nodes }
}

Evaluations.defaultProps = {
    evaluations: {},
    nodes: {},
};

export default connect(mapStateToProps)(Evaluations)
