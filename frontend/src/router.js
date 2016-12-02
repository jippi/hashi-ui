import React, { PropTypes } from 'react';
import { Router, Route, Redirect, IndexRedirect, browserHistory } from 'react-router';

import App from './components/app';
import Cluster from './containers/cluster';

import Jobs from './containers/jobs';
import Job from './containers/job';
import JobInfo from './components/JobInfo/JobInfo';
import JobAllocs from './components/JobAllocations/JobAllocations';
import JobEvals from './components/JobEvaluations/JobEvaluations';
import JobTasks from './components/JobTasks/JobTasks';
import JobTaskGroups from './components/JobTaskGroups/JobTaskGroups';
import JobRaw from './components/JobRaw/JobRaw';

import Allocations from './containers/allocations';
import Allocation from './containers/allocation';
import AllocInfo from './components/AllocationInfo/AllocationInfo';
import AllocFiles from './components/AllocationFiles/AllocationFiles';
import AllocRaw from './components/AllocationRaw/AllocationRaw';

import Evaluations from './containers/evaluations';
import Evaluation from './containers/evaluation';
import EvalInfo from './components/EvaluationInfo/EvaluationInfo';
import EvalAllocations from './components/EvaluationAllocations/EvaluationAllocations';
import EvalRaw from './components/EvaluationRaw/EvaluationRaw';

import Clients from './containers/clients';
import Client from './containers/client';
import ClientInfo from './components/ClientInfo/ClientInfo';
import ClientAllocations from './components/ClientAllocations/ClientAllocations';
import ClientEvaluations from './components/ClientEvaluations/ClientEvaluations';
import ClientRaw from './components/ClientRaw/ClientRaw';

import Servers from './containers/servers';
import Server from './containers/server';
import ServerInfo from './components/ServerInfo/ServerInfo';
import ServerRaw from './components/ServerRaw/ServerRaw';

const AppRouter = ({ history }) =>
  <Router history={ history }>
    <Route path="/" component={ App }>
      <IndexRedirect to="/cluster" />
      <Route path="/cluster" component={ Cluster } />

      <Route path="/servers" component={ Servers } />
      <Route path="/servers/:memberId" component={ Server }>
        <IndexRedirect to="/servers/:memberId/info" />
        <Route path="/servers/:memberId/info" component={ ServerInfo } />
        <Route path="/servers/:memberId/raw" component={ ServerRaw } />
      </Route>

      <Route path="/jobs" component={ Jobs } />
      <Route path="/jobs/:jobId" component={ Job }>
        <IndexRedirect to="/jobs/:jobId/info" />
        <Route path="/jobs/:jobId/info" component={ JobInfo } />
        <Route path="/jobs/:jobId/allocations" component={ JobAllocs } />
        <Route path="/jobs/:jobId/evaluations" component={ JobEvals } />
        <Route path="/jobs/:jobId/tasks" component={ JobTasks } />
        <Route path="/jobs/:jobId/taskGroups" component={ JobTaskGroups } />
        <Route path="/jobs/:jobId/raw" component={ JobRaw } />
      </Route>

      <Route path="/clients" component={ Clients } />
      <Route path="/clients/:nodeId" component={ Client }>
        <IndexRedirect to="/clients/:nodeId/info" />
        <Route path="/clients/:nodeId/info" component={ ClientInfo } />
        <Route path="/clients/:nodeId/allocations" component={ ClientAllocations } />
        <Route path="/clients/:nodeId/evaluations" component={ ClientEvaluations } />
        <Route path="/clients/:nodeId/raw" component={ ClientRaw } />
      </Route>

      <Route path="/allocations" component={ Allocations } />
      <Route path="/allocations/:allocId" component={ Allocation }>
        <IndexRedirect to="/allocations/:allocId/info" />
        <Route path="/allocations/:allocId/info" component={ AllocInfo } />
        <Redirect
          from="/allocations/:allocId/logs"
          to="/allocations/:allocId/files"
          query={{ path: '/alloc/logs/' }}
        />
        <Route path="/allocations/:allocId/files" component={ AllocFiles } query={{ path: '' }} />
        <Route path="/allocations/:allocId/raw" component={ AllocRaw } />
      </Route>

      <Route path="/evaluations" component={ Evaluations } />
      <Route path="/evaluations/:evalId" component={ Evaluation }>
        <IndexRedirect to="/evaluations/:evalId/info" />
        <Route path="/evaluations/:evalId/info" component={ EvalInfo } />
        <Route path="/evaluations/:evalId/allocations" component={ EvalAllocations } />
        <Route path="/evaluations/:evalId/raw" component={ EvalRaw } />
      </Route>
    </Route>
  </Router>;

AppRouter.propTypes = {
  history: PropTypes.instanceOf(browserHistory.constructor).isRequired,
};

export default AppRouter;
