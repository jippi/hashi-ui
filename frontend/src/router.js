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

import Nodes from './containers/nodes';
import Node from './containers/node';
import NodeInfo from './components/node/info';
import NodeRaw from './components/node/raw';

import Members from './containers/members';
import Member from './containers/member';
import MemberInfo from './components/member/info';
import MemberRaw from './components/member/raw';


class AppRouter extends Component {

    render() {
        return (
           <Router history={this.props.history}>
                <Route path="/" component={App}>
                    <IndexRedirect to="/cluster" />
                    <Route path="/cluster" component={Cluster} />

                    <Route path="/members" component={Members} />
                    <Route path="/members/:memberId" component={Member}>
                        <IndexRedirect to="/members/:memberId/info" />
                        <Route path="/members/:memberId/info" component={MemberInfo} />
                        <Route path="/members/:memberId/raw" component={MemberRaw} />
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

                    <Route path="/nodes" component={Nodes} />
                    <Route path="/nodes/:nodeId" component={Node}>
                        <IndexRedirect to="/nodes/:nodeId/info" />
                        <Route path="/nodes/:nodeId/info" component={NodeInfo} />
                        <Route path="/nodes/:nodeId/raw" component={NodeRaw} />
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
