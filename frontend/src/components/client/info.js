import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import MetaDisplay from '../meta';

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
    <div className="row">
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6">
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
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6">
        <legend>Meta Properties</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ node.Meta } />
      </div>
    </div>
    <div className="row">
      <div className="col-lg-12 col-md-12 col-sm-12 col-sx-12">
        <div className="content">
          <legend>Client Attributes</legend>
          <MetaDisplay dtWithClass="wide" metaBag={ node.Attributes } />
        </div>
      </div>
    </div>
  </div>;

function mapStateToProps({ node }) {
    return { node };
}

ClientInfo.propTypes = {
    node: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(ClientInfo);
