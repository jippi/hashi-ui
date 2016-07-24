import React, { Component } from 'react';
import { connect } from 'react-redux';

class NodeInfo extends Component {

    render() {

        const nodeProps = [
            "ID",
            "Name",
            "Status",
            "Datacenter",
            "Drain",
            "HTTPAddr",
            "NodeClass"
        ]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Node Properties</legend>
                    <dl className="dl-horizontal">
                        {nodeProps.map((nodeProp) => {
                            return (
                                <div key={nodeProp}>
                                    <dt>{nodeProp}</dt>
                                    <dd>{this.props.node[nodeProp]}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ node }) {
    return { node }
}

export default connect(mapStateToProps)(NodeInfo);
