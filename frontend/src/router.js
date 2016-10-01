import React, { Component } from 'react';
import { Router, Route, IndexRedirect } from 'react-router';

import App from './components/app';
import Cluster from './containers/cluster';

import Jobs from './containers/jobs';
import Job from './containers/job';
import JobInfo from './components/job/info';
import JobAllocs from './components/job/allocs';
import JobEvals from './components/job/evals';
import JobTasks from './components/job/tasks';
import JobTaskGroups from './components/job/taskGroups';
import JobRaw from './components/job/raw';

import Allocations from './containers/allocations';
import Allocation from './containers/allocation';
import AllocInfo from './components/allocation/info';
import AllocFiles from './components/allocation/files';
import AllocRaw from './components/allocation/raw';

import Evaluations from './containers/evaluations';
import Evaluation from './containers/evaluation';
import EvalInfo from './components/evaluation/info';
import EvalAlloc from './components/evaluation/allocs';
import EvalRaw from './components/evaluation/raw';

import Clients from './containers/clients';
import Client from './containers/client';
import ClientInfo from './components/client/info';
import ClientRaw from './components/client/raw';

import Servers from './containers/servers';
import Server from './containers/server';
import ServerInfo from './components/server/info';
import ServerRaw from './components/server/raw';

class AppRouter extends Component {

    render() {
        return (
           <Router history={this.props.history}>
                <Route path="/" component={App}>
                    <IndexRedirect to="/cluster" />
                    <Route path="/cluster" component={Cluster} />

                    <Route path="/servers" component={Servers} />
                    <Route path="/servers/:memberId" component={Server}>
                        <IndexRedirect to="/servers/:memberId/info" />
                        <Route path="/servers/:memberId/info" component={ServerInfo} />
                        <Route path="/servers/:memberId/raw" component={ServerRaw} />
                    </Route>

                    <Route path="/jobs" component={Jobs} />
                    <Route path="/jobs/:jobId" component={Job}>
                        <IndexRedirect to="/jobs/:jobId/info" />
                        <Route path="/jobs/:jobId/info" component={JobInfo} />
                        <Route path="/jobs/:jobId/allocations" component={JobAllocs} />
                        <Route path="/jobs/:jobId/evaluations" component={JobEvals} />
                        <Route path="/jobs/:jobId/tasks" component={JobTasks} />
                        <Route path="/jobs/:jobId/taskGroups" component={JobTaskGroups} />
                        <Route path="/jobs/:jobId/raw" component={JobRaw} />
                    </Route>

                    <Route path="/clients" component={Clients} />
                    <Route path="/clients/:nodeId" component={Client}>
                        <IndexRedirect to="/clients/:nodeId/info" />
                        <Route path="/clients/:nodeId/info" component={ClientInfo} />
                        <Route path="/clients/:nodeId/raw" component={ClientRaw} />
                    </Route>

                    <Route path="/allocations" component={Allocations} />
                    <Route path="/allocations/:allocId" component={Allocation}>
                        <IndexRedirect to="/allocations/:allocId/info" />
                        <Route path="/allocations/:allocId/info" component={AllocInfo} />
                        <Route path="/allocations/:allocId/files" component={AllocFiles} />
                        <Route path="/allocations/:allocId/raw" component={AllocRaw} />
                    </Route>

                    <Route path="/evaluations" component={Evaluations} />
                    <Route path="/evaluations/:evalId" component={Evaluation}>
                        <IndexRedirect to="/evaluations/:evalId/info" />
                        <Route path="/evaluations/:evalId/info" component={EvalInfo} />
                        <Route path="/evaluations/:evalId/allocations" component={EvalAlloc} />
                        <Route path="/evaluations/:evalId/raw" component={EvalRaw} />
                    </Route>
                </Route>
           </Router>
        )
    }
};

export default AppRouter;
