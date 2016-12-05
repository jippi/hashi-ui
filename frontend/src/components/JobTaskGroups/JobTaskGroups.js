import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import NomadLink from '../NomadLink/NomadLink';
import TableHelper from '../TableHelper/TableHelper';
import RawJson from '../RawJson/RawJson';
import MetaPayload from '../MetaPayload/MetaPayload';

const taskGroupHeaders = [
  'ID',
  'Name',
  'Count',
  'Meta',
  'Restart Policy',
];

const JobTaskGroups = ({ job, location }) => {
  const taskGroups = [];

  job.TaskGroups.forEach((taskGroup) => {
    taskGroups.push(
      <tr key={ taskGroup.ID }>
        <td><NomadLink taskGroupId={ taskGroup.ID } jobId={ job.ID } short="true" /></td>
        <td>{ taskGroup.Name }</td>
        <td>{ taskGroup.Count }</td>
        <td><MetaPayload metaBag={ taskGroup.Meta } asTooltip /></td>
        <td>{ taskGroup.RestartPolicy.Mode }</td>
      </tr>
        );
  });

  let taskGroupId = location.query.taskGroupId;

    // Auto-select first task group if only one is available.
  if (!taskGroupId && job.TaskGroups.length === 1) {
    taskGroupId = job.TaskGroups[0].ID;
  }
  return (
    <div className="tab-pane active">
      <div className="row">
        <div className="col-md-6 tab-column">
          <legend>Task Groups</legend>
          { (taskGroups.length > 0) ?
            <TableHelper
              classes="table table-hover table-striped"
              headers={ taskGroupHeaders }
              body={ taskGroups }
            />
              : null
            }
        </div>
        <div className="col-md-6 tab-column">
          <legend>Task Group: { taskGroupId }</legend>
          { job.TaskGroups
                .filter(taskGroup => taskGroup.ID === taskGroupId)
                .map(taskGroup => <RawJson json={ taskGroup } />)
                .pop()
            }
        </div>
      </div>
    </div>
  );
};

function mapStateToProps({ job }) {
  return { job };
}

JobTaskGroups.propTypes = {
  job: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(JobTaskGroups);
