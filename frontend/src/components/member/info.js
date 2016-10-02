import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Table from '../table';

const memberProps = [
    'ID',
    'Name',
    'Address',
    'Port',
    'Status',
];

const MemberInfo = ({ member }) => {
    const tags = member.Tags;

    const memberTags = Object.keys(tags).map((key) => {
        const name = key;
        const value = tags[key];

        return (
          <tr key={ name }>
            <td>{ name }</td>
            <td>{ value }</td>
          </tr>
        );
    });

    return (
      <div className="tab-pane active">
        <div className="content">
          <legend>Member Properties</legend>
          <dl className="dl-horizontal">
            {memberProps.map(memberProp =>
              <div key={ memberProp }>
                <dt>{memberProp}</dt>
                <dd>{this.props.member[memberProp]}</dd>
              </div>
            )}
          </dl>
          <br />
          <legend>Member Tags</legend>
          {(memberTags.length > 0) ?
            <Table classes="table table-hover table-striped" headers={ ['Name', 'Value'] } body={ memberTags } />
            : null
          }
        </div>
      </div>
    );
};

function mapStateToProps({ member }) {
    return { member };
}

MemberInfo.propTypes = {
    member: PropTypes.isRequired,
};

export default connect(mapStateToProps)(MemberInfo);
