import React, { PropTypes } from 'react';
import NomadLink from '../NomadLink/NomadLink';

const EvaluationList = ({ evaluations, containerClassName }) =>
  <div className={ containerClassName }>
    <div className="table-responsive table-full-width">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th width="150">ID</th>
            <th>Job</th>
            <th width="150">Type</th>
            <th width="150">Priority</th>
            <th width="150">Status</th>
            <th>Status Description</th>
            <th width="150">Parent</th>
            <th width="150">Triggered by</th>
          </tr>
        </thead>
        <tbody>
          { evaluations.map(evaluation =>
            <tr key={ evaluation.ID }>
              <td><NomadLink evalId={ evaluation.ID } short="true" /></td>
              <td><NomadLink jobId={ evaluation.JobID } short="true" /></td>
              <td>{ evaluation.Type }</td>
              <td>{ evaluation.Priority }</td>
              <td>{ evaluation.Status }</td>
              <td>{ evaluation.StatusDescription }</td>
              <td><NomadLink evalId={ evaluation.PreviousEval } short="true" /></td>
              <td>{ evaluation.TriggeredBy }</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>;

EvaluationList.defaultProps = {
  evaluations: [],
  containerClassName: '',
};

EvaluationList.propTypes = {
  evaluations: PropTypes.array.isRequired,
  containerClassName: PropTypes.string.isRequired,
};

export default EvaluationList;
