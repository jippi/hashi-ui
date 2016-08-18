import React, { Component } from 'react';
import { connect } from 'react-redux';

import Table from '../table'

class MemberInfo extends Component {

    render() {

        const tags = this.props.member.Tags;
        const memberTags = Object.keys(tags).map((key) => {
            var name = key;
            var value = tags[key];

            return (
                <tr key={name}>
                    <td>{name}</td>
                    <td>{value}</td>
                </tr>
            )
        });

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
                    <br />
                    <legend>Member Tags</legend>
                    {(memberTags.length > 0) ?
                        <Table classes="table table-hover table-striped" headers={["Name", "Value"]} body={memberTags} />
                        : null
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps({ member }) {
    return { member }
}

export default connect(mapStateToProps)(MemberInfo);
