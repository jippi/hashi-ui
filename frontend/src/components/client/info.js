import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const nodeProps = [
    'ID',
    'Name',
    'Status',
    'Datacenter',
    'Drain',
    'HTTPAddr',
    'NodeClass',
];

const ClientInfo = ({ node }) =>
  <div className="tab-pane active">
    <div className="content">
      <legend>Client Properties</legend>
      <dl className="dl-horizontal">
        { nodeProps.map(nodeProp =>
          <div key={ nodeProp }>
            <dt>{ nodeProp }</dt>
            <dd>{ node[nodeProp] }</dd>
          </div>
        )}
      </dl>
    </div>
  </div>;

function mapStateToProps({ node }) {
    return { node };
}

ClientInfo.propTypes = {
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientInfo);
