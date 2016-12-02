import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Table from '../Table/Table';

const memberProps = [
  'ID',
  'Name',
  'Address',
  'Port',
  'Status',
];

const ServerInfo = ({ member }) => {
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
        <legend>Server Properties</legend>
        <dl className="dl-horizontal">
          { memberProps.map(memberProp =>
            <div key={ memberProp }>
              <dt>{ memberProp }</dt>
              <dd>{ member[memberProp] }</dd>
            </div>
            )}
        </dl>
        <br />
        <legend>Server Tags</legend>
        { (memberTags.length > 0) ?
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

ServerInfo.propTypes = {
  member: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ServerInfo);
