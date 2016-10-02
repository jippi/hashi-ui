import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const evalProps = [
    'ID',
    'Status',
    'Priority',
    'Type',
    'JobID',
    'TriggeredBy',
];

const EvalInfo = ({ evaluation }) =>
  <div className="tab-pane active">
    <div className="content">
      <legend>Evaluation Properties</legend>
      <dl className="dl-horizontal">
        {evalProps.map(evalProp =>
          <div key={ evalProp }>
            <dt>{ evalProp }</dt>
            <dd>{ evaluation[evalProp] }</dd>
          </div>
        )}
      </dl>
    </div>
  </div>;

function mapStateToProps({ evaluation }) {
    return { evaluation };
}

EvalInfo.propTypes = {
    evaluation: PropTypes.isRequired,
};

export default connect(mapStateToProps)(EvalInfo);
