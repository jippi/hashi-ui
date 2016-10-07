import React, { PropTypes } from 'react';
import NomadLink from '../link';

const EvaluationList = ({ evaluations, nodes }) =>
  <div className="content table-responsive table-full-width">
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Job</th>
          <th>Status</th>
          <th>Type</th>
          <th>Priority</th>
          <th>Node</th>
        </tr>
      </thead>
      <tbody>
        { evaluations.map(evaluation =>
          <tr key={ evaluation.ID }>
            <td><NomadLink evalId={ evaluation.ID } short="true" /></td>
            <td><NomadLink jobId={ evaluation.JobID } short="true" /></td>
            <td>{ evaluation.Status }</td>
            <td>{ evaluation.Type }</td>
            <td>{ evaluation.Priority }</td>
            <td>
              <NomadLink nodeId={ evaluation.NodeID } nodeList={ nodes } short="true" />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;

EvaluationList.defaultProps = {
    evaluations: [],
    nodes: [],
};

EvaluationList.propTypes = {
    evaluations: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
};

export default EvaluationList;
