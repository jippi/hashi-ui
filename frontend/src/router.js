import React, { PropTypes } from 'react'
import { Router, Route, Redirect, IndexRedirect, browserHistory } from 'react-router'

import App from './components/app'
import Cluster from './containers/cluster'

import Jobs from './containers/jobs'
import Job from './containers/job'
import JobInfo from './components/JobInfo/JobInfo'
import JobAllocs from './components/JobAllocations/JobAllocations'
import JobEvals from './components/JobEvaluations/JobEvaluations'
import JobTasks from './components/JobTasks/JobTasks'
import JobTaskGroups from './components/JobTaskGroups/JobTaskGroups'
import JobRaw from './components/JobRaw/JobRaw'

import Allocations from './containers/allocations'
import Allocation from './containers/allocation'
import AllocInfo from './components/AllocationInfo/AllocationInfo'
import AllocFiles from './components/AllocationFiles/AllocationFiles'
import AllocRaw from './components/AllocationRaw/AllocationRaw'

import Evaluations from './containers/evaluations'
import Evaluation from './containers/evaluation'
import EvalInfo from './components/EvaluationInfo/EvaluationInfo'
import EvalAllocations from './components/EvaluationAllocations/EvaluationAllocations'
import EvalRaw from './components/EvaluationRaw/EvaluationRaw'

import Clients from './containers/clients'
import Client from './containers/client'
import ClientInfo from './components/ClientInfo/ClientInfo'
import ClientStats from './components/ClientStats/ClientStats'
import ClientAllocations from './components/ClientAllocations/ClientAllocations'
import ClientEvaluations from './components/ClientEvaluations/ClientEvaluations'
import ClientRaw from './components/ClientRaw/ClientRaw'

import Servers from './containers/servers'
import Server from './containers/server'
import ServerInfo from './components/ServerInfo/ServerInfo'
import ServerRaw from './components/ServerRaw/ServerRaw'

const AppRouter = ({ history }) =>
  <Router history={ history }>
    <Route path='/' component={ App }>
      <IndexRedirect to='/nomad/cluster' />
      <Route path='/nomad/cluster' component={ Cluster } />

      <Route path='/nomad/servers' component={ Servers } />
      <Route path='/nomad/servers/:memberId' component={ Server }>
        <IndexRedirect to='/nomad/servers/:memberId/info' />
        <Route path='/nomad/servers/:memberId/info' component={ ServerInfo } />
        <Route path='/nomad/servers/:memberId/raw' component={ ServerRaw } />
      </Route>

      <Route path='/nomad/jobs' component={ Jobs } />
      <Route path='/nomad/jobs/:jobId' component={ Job }>
        <IndexRedirect to='/nomad/jobs/:jobId/info' />
        <Route path='/nomad/jobs/:jobId/info' component={ JobInfo } />
        <Route path='/nomad/jobs/:jobId/allocations' component={ JobAllocs } />
        <Route path='/nomad/jobs/:jobId/evaluations' component={ JobEvals } />
        <Route path='/nomad/jobs/:jobId/tasks' component={ JobTasks } />
        <Route path='/nomad/jobs/:jobId/taskGroups' component={ JobTaskGroups } />
        <Route path='/nomad/jobs/:jobId/raw' component={ JobRaw } />
      </Route>

      <Route path='/nomad/clients' component={ Clients } />
      <Route path='/nomad/clients/:nodeId' component={ Client }>
        <IndexRedirect to='/nomad/clients/:nodeId/info' />
        <Route path='/nomad/clients/:nodeId/info' component={ ClientInfo } />
        <Route path='/nomad/clients/:nodeId/stats' component={ ClientStats } />
        <Route path='/nomad/clients/:nodeId/allocations' component={ ClientAllocations } />
        <Route path='/nomad/clients/:nodeId/evaluations' component={ ClientEvaluations } />
        <Route path='/nomad/clients/:nodeId/raw' component={ ClientRaw } />
      </Route>

      <Route path='/nomad/allocations' component={ Allocations } />
      <Route path='/nomad/allocations/:allocId' component={ Allocation }>
        <IndexRedirect to='/nomad/allocations/:allocId/info' />
        <Route path='/nomad/allocations/:allocId/info' component={ AllocInfo } />
        <Redirect
          from='/nomad/allocations/:allocId/logs'
          to='/nomad/allocations/:allocId/files'
          query={{ path: '/alloc/logs/' }}
        />
        <Route path='/nomad/allocations/:allocId/files' component={ AllocFiles } query={{ path: '' }} />
        <Route path='/nomad/allocations/:allocId/raw' component={ AllocRaw } />
      </Route>

      <Route path='/nomad/evaluations' component={ Evaluations } />
      <Route path='/nomad/evaluations/:evalId' component={ Evaluation }>
        <IndexRedirect to='/nomad/evaluations/:evalId/info' />
        <Route path='/nomad/evaluations/:evalId/info' component={ EvalInfo } />
        <Route path='/nomad/evaluations/:evalId/allocations' component={ EvalAllocations } />
        <Route path='/nomad/evaluations/:evalId/raw' component={ EvalRaw } />
      </Route>
    </Route>
  </Router>

AppRouter.propTypes = {
  history: PropTypes.instanceOf(browserHistory.constructor).isRequired
}

export default AppRouter
