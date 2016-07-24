import React, { Component } from 'react';
import { connect } from 'react-redux';

class AllocInfo extends Component {

    render() {

        const allocProps = [
            "ID",
            "Name",
            "TaskGroup",
            "DesiredStatus",
            "ClientStatus",
            "JobID",
            "NodeID"
        ]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Allocation Properties</legend>
                    <dl className="dl-horizontal">
                        {allocProps.map((allocProp) => {
                            return (
                                <div key={allocProp}>
                                    <dt>{allocProp}</dt>
                                    <dd>{this.props.allocation[allocProp]}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation }) {
    return { allocation }
}

export default connect(mapStateToProps)(AllocInfo);
