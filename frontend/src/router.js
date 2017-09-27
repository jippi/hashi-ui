import React from "react"
import PropTypes from "prop-types"
import { Router, Route, Redirect, IndexRedirect, browserHistory } from "react-router"
import Loadable from "react-loadable"
import App from "./components/app"

const Allocation = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Allocation" */ "./containers/allocation")
})
const Allocations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Allocations" */ "./containers/allocations")
})
const AllocFiles = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "AllocFiles" */ "./components/AllocationFiles/AllocationFiles")
})
const AllocInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "AllocInfo" */ "./components/AllocationInfo/AllocationInfo")
})
const AllocRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "AllocRaw" */ "./components/AllocationRaw/AllocationRaw")
})
const AllocStats = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "AllocStats" */ "./components/AllocationStats/AllocationStats")
})
const Client = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Client" */ "./containers/client")
})
const ClientAllocations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ClientAllocations" */ "./components/ClientAllocations/ClientAllocations")
})
const ClientEvaluations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ClientEvaluations" */ "./components/ClientEvaluations/ClientEvaluations")
})
const ClientInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ClientInfo" */ "./components/ClientInfo/ClientInfo")
})
const ClientRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ClientRaw" */ "./components/ClientRaw/ClientRaw")
})
const Clients = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Clients" */ "./containers/clients")
})
const ClientStats = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ClientStats" */ "./components/ClientStats/ClientStats")
})
const Cluster = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Cluster" */ "./containers/cluster")
})
const ConsulKV = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ConsulKV" */ "./containers/consul_kv")
})
const ConsulNodes = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ConsulNodes" */ "./containers/consul_nodes")
})
const ConsulServices = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ConsulServices" */ "./containers/consul_services")
})
const Deployment = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Deployment" */ "./containers/deployment")
})
const DeploymentAllocations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () =>
    import(/* webpackChunkName: "DeploymentAllocations" */ "./components/DeploymentAllocations/DeploymentAllocations")
})
const DeploymentInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "DeploymentInfo" */ "./components/DeploymentInfo/DeploymentInfo")
})
const DeploymentRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "DeploymentRaw" */ "./components/DeploymentRaw/DeploymentRaw")
})
const Deployments = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Deployments" */ "./containers/deployments")
})
const EvalAllocations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () =>
    import(/* webpackChunkName: "EvalAllocations" */ "./components/EvaluationAllocations/EvaluationAllocations")
})
const EvalInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "EvalInfo" */ "./components/EvaluationInfo/EvaluationInfo")
})
const EvalRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "EvalRaw" */ "./components/EvaluationRaw/EvaluationRaw")
})
const Evaluation = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Evaluation" */ "./containers/evaluation")
})
const Evaluations = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Evaluations" */ "./containers/evaluations")
})
const Job = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Job" */ "./containers/job")
})
const JobAllocs = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobAllocs" */ "./components/JobAllocations/JobAllocations")
})
const JobChildren = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobChildren" */ "./components/JobChildren/JobChildren")
})
const JobDeployments = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobDeployments" */ "./components/JobDeployments/JobDeployments")
})
const JobEvals = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobEvals" */ "./components/JobEvaluations/JobEvaluations")
})
const JobInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobInfo" */ "./components/JobInfo/JobInfo")
})
const JobRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobRaw" */ "./components/JobRaw/JobRaw")
})
const Jobs = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Jobs" */ "./containers/jobs")
})
const JobTaskGroups = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "JobTaskGroups" */ "./components/JobTaskGroups/JobTaskGroups")
})
const SelectConsulRegion = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "SelectConsulRegion" */ "./containers/select_consul_region")
})
const SelectNomadRegion = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "SelectNomadRegion" */ "./containers/select_nomad_region")
})
const Server = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Server" */ "./containers/server")
})
const ServerInfo = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ServerInfo" */ "./components/ServerInfo/ServerInfo")
})
const ServerRaw = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "ServerRaw" */ "./components/ServerRaw/ServerRaw")
})
const Servers = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "Servers" */ "./containers/servers")
})
const SystemX = Loadable({
  loading: () => <div>Loading resources</div>,
  loader: () => import(/* webpackChunkName: "System" */ "./containers/system")
})

const AppRouter = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={App}>
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
      <Route path="/nomad/:region/system" component={SystemX} />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  history: PropTypes.instanceOf(browserHistory.constructor).isRequired
}

export default AppRouter
