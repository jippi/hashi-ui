import React from "react"
import PropTypes from "prop-types"
import { Router, Route, Redirect, IndexRedirect, browserHistory } from "react-router"

import App from "./components/app"
import Cluster from "./containers/cluster"

import Jobs from "./containers/jobs"
import Job from "./containers/job"
import JobInfo from "./components/JobInfo/JobInfo"
import JobAllocs from "./components/JobAllocations/JobAllocations"
import JobChildren from "./components/JobChildren/JobChildren"
import JobDeployments from "./components/JobDeployments/JobDeployments"
import JobEvals from "./components/JobEvaluations/JobEvaluations"
import JobTaskGroups from "./components/JobTaskGroups/JobTaskGroups"
import JobRaw from "./components/JobRaw/JobRaw"

import Allocations from "./containers/allocations"
import Allocation from "./containers/allocation"
import AllocInfo from "./components/AllocationInfo/AllocationInfo"
import AllocStats from "./components/AllocationStats/AllocationStats"
import AllocFiles from "./components/AllocationFiles/AllocationFiles"
import AllocRaw from "./components/AllocationRaw/AllocationRaw"

import Evaluations from "./containers/evaluations"
import Evaluation from "./containers/evaluation"
import EvalInfo from "./components/EvaluationInfo/EvaluationInfo"
import EvalAllocations from "./components/EvaluationAllocations/EvaluationAllocations"
import EvalRaw from "./components/EvaluationRaw/EvaluationRaw"

import Deployments from "./containers/deployments"
import Deployment from "./containers/deployment"
import DeploymentInfo from "./components/DeploymentInfo/DeploymentInfo"
import DeploymentAllocations from "./components/DeploymentAllocations/DeploymentAllocations"
import DeploymentRaw from "./components/DeploymentRaw/DeploymentRaw"

import Clients from "./containers/clients"
import Client from "./containers/client"
import ClientInfo from "./components/ClientInfo/ClientInfo"
import ClientStats from "./components/ClientStats/ClientStats"
import ClientAllocations from "./components/ClientAllocations/ClientAllocations"
import ClientEvaluations from "./components/ClientEvaluations/ClientEvaluations"
import ClientRaw from "./components/ClientRaw/ClientRaw"

import Servers from "./containers/servers"
import Server from "./containers/server"
import ServerInfo from "./components/ServerInfo/ServerInfo"
import ServerRaw from "./components/ServerRaw/ServerRaw"

import SelectNomadRegion from "./containers/select_nomad_region"

import ConsulKV from "./containers/consul_kv"
import ConsulServices from "./containers/consul_services"
import ConsulNodes from "./containers/consul_nodes"
import SelectConsulRegion from "./containers/select_consul_region"

import System from "./containers/system"

const AppRouter = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={App}>
      // Legacy routes
      <Redirect from="/cluster" to="/nomad" />
      <Redirect from="/servers" to="/nomad" />
      <Redirect from="/servers/**" to="/nomad" />
      <Redirect from="/clients" to="/nomad" />
      <Redirect from="/clients/**" to="/nomad" />
      <Redirect from="/jobs" to="/nomad" />
      <Redirect from="/jobs/**" to="/nomad" />
      <Redirect from="/allocations" to="/nomad" />
      <Redirect from="/allocations/**" to="/nomad" />
      <Redirect from="/evaluations/" to="/nomad" />
      <Redirect from="/evaluations/**" to="/nomad" />
      <IndexRedirect to="/nomad" />
      // Consul
      <Route path="/consul" component={SelectConsulRegion} />
      <Redirect from="/consul/:region" to="/consul/:region/services" />
      <Route path="/consul/:region/kv" component={ConsulKV} />
      <Route path="/consul/:region/kv/*" component={ConsulKV} />
      <Route path="/consul/:region/nodes" component={ConsulNodes} />
      <Route path="/consul/:region/nodes/:name" component={ConsulNodes} />
      <Route path="/consul/:region/services" component={ConsulServices} />
      <Route path="/consul/:region/services/:name" component={ConsulServices} />
      // Nomad
      <Route path="/nomad" component={SelectNomadRegion} />
      <Redirect from="/nomad/:region" to="/nomad/:region/cluster" />
      <Route path="/nomad/:region/cluster" component={Cluster} />
      /* servers */
      <Route path="/nomad/:region/servers" component={Servers} />
      <Route path="/nomad/:region/servers/:memberId" component={Server}>
        <IndexRedirect to="/nomad/:region/servers/:memberId/info" />
        <Route path="/nomad/:region/servers/:memberId/info" component={ServerInfo} />
        <Route path="/nomad/:region/servers/:memberId/raw" component={ServerRaw} />
      </Route>
      /* jobs */
      <Route path="/nomad/:region/jobs" component={Jobs} />
      <Route path="/nomad/:region/jobs/:jobId" component={Job}>
        <IndexRedirect to="/nomad/:region/jobs/:jobId/info" />
        <Route path="/nomad/:region/jobs/:jobId/info" component={JobInfo} />
        <Route path="/nomad/:region/jobs/:jobId/allocations" component={JobAllocs} />
        <Route path="/nomad/:region/jobs/:jobId/children" component={JobChildren} />
        <Route path="/nomad/:region/jobs/:jobId/deployments" component={JobDeployments} />
        <Route path="/nomad/:region/jobs/:jobId/evaluations" component={JobEvals} />
        <Route path="/nomad/:region/jobs/:jobId/groups" component={JobTaskGroups} />
        <Route path="/nomad/:region/jobs/:jobId/raw" component={JobRaw} />
      </Route>
      /* clients */
      <Route path="/nomad/:region/clients" component={Clients} />
      <Route path="/nomad/:region/clients/:nodeId" component={Client}>
        <IndexRedirect to="/nomad/:region/clients/:nodeId/info" />
        <Route path="/nomad/:region/clients/:nodeId/info" component={ClientInfo} />
        <Route path="/nomad/:region/clients/:nodeId/stats" component={ClientStats} />
        <Route path="/nomad/:region/clients/:nodeId/allocations" component={ClientAllocations} />
        <Route path="/nomad/:region/clients/:nodeId/evaluations" component={ClientEvaluations} />
        <Route path="/nomad/:region/clients/:nodeId/raw" component={ClientRaw} />
      </Route>
      /* deployments */
      <Route path="/nomad/:region/deployments" component={Deployments} />
      <Route path="/nomad/:region/deployments/:id" component={Deployment}>
        <IndexRedirect to="/nomad/:region/deployments/:id/info" />
        <Route path="/nomad/:region/deployments/:id/info" component={DeploymentInfo} />
        <Route path="/nomad/:region/deployments/:id/allocations" component={DeploymentAllocations} />
        <Route path="/nomad/:region/deployments/:id/raw" component={DeploymentRaw} />
      </Route>
      /* allocations */
      <Route path="/nomad/:region/allocations" component={Allocations} />
      <Route path="/nomad/:region/allocations/:allocId" component={Allocation}>
        <IndexRedirect to="/nomad/:region/allocations/:allocId/info" />
        <Route path="/nomad/:region/allocations/:allocId/info" component={AllocInfo} />
        <Route path="/nomad/:region/allocations/:allocId/stats" component={AllocStats} />
        <Redirect
          from="/nomad/:region/allocations/:allocId/logs"
          to="/nomad/:region/allocations/:allocId/files"
          query={{ path: "/alloc/logs/" }}
        />
        <Route path="/nomad/:region/allocations/:allocId/files" component={AllocFiles} query={{ path: "" }} />
        <Route path="/nomad/:region/allocations/:allocId/raw" component={AllocRaw} />
      </Route>
      /* evaluations */
      <Route path="/nomad/:region/evaluations" component={Evaluations} />
      <Route path="/nomad/:region/evaluations/:evalId" component={Evaluation}>
        <IndexRedirect to="/nomad/:region/evaluations/:evalId/info" />
        <Route path="/nomad/:region/evaluations/:evalId/info" component={EvalInfo} />
        <Route path="/nomad/:region/evaluations/:evalId/allocations" component={EvalAllocations} />
        <Route path="/nomad/:region/evaluations/:evalId/raw" component={EvalRaw} />
      </Route>
      /* system */
      <Route path="/nomad/:region/system" component={System} />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  history: PropTypes.instanceOf(browserHistory.constructor).isRequired
}

export default AppRouter
