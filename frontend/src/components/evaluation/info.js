import React, { Component } from 'react';
import { connect } from 'react-redux';

class EvalInfo extends Component {

    render() {

        const evalProps = [
            "ID",
            "Status",
            "Priority",
            "Type",
            "JobID",
            "TriggeredBy"
        ]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Evaluation Properties</legend>
                    <dl className="dl-horizontal">
                        {evalProps.map((evalProp) => {
                            return (
                                <div key={evalProp}>
                                    <dt>{evalProp}</dt>
                                    <dd>{this.props.evaluation[evalProp]}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ evaluation }) {
    return { evaluation }
}

export default connect(mapStateToProps)(EvalInfo);
