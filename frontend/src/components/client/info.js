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

const withPrefix = function withPrefix(obj, prefix) {
    const result = {};

    Object.keys(obj || {}).forEach((key) => {
        if (key.startsWith(prefix)) {
            result[key.replace(prefix, '')] = obj[key];
        }
    });

    return result;
};

const ClientInfo = ({ node }) =>
  <div className="tab-pane active">
    <div className="row">
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
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
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>Meta Properties</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ node.Meta } />
      </div>
    </div>
    <div className="row">
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>CPU Attributes</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ withPrefix(node.Attributes, 'cpu.') } />
      </div>
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>Driver Attributes</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ withPrefix(node.Attributes, 'driver.') } />
      </div>
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>Kernel Attributes</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ withPrefix(node.Attributes, 'kernel.') } />
      </div>
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>Unique Attributes</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ withPrefix(node.Attributes, 'unique.') } />
      </div>
      <div className="col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column">
        <legend>Nomad Attributes</legend>
        <MetaDisplay dtWithClass="wide" metaBag={ withPrefix(node.Attributes, 'nomad.') } />
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
