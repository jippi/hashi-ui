import React, { Component } from 'react';
import { connect } from 'react-redux';

class MemberInfo extends Component {

    render() {

        const memberProps = [
            "ID",
            "Name",
            "Addr",
            "Port",
            "Status"
        ]

        return (
            <div className="tab-pane active">
                <div className="content">
                    <legend>Member Properties</legend>
                    <dl className="dl-horizontal">
                        {memberProps.map((memberProp) => {
                            return (
                                <div key={memberProp}>
                                    <dt>{memberProp}</dt>
                                    <dd>{this.props.member[memberProp]}</dd>
                                </div>
                            )
                        }, this)}
                    </dl>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ member }) {
    return { member }
}

export default connect(mapStateToProps)(MemberInfo);
