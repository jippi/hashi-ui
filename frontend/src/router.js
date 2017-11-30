import React from "react"
import PropTypes from "prop-types"
import { Router, Route, Redirect, IndexRedirect, browserHistory } from "react-router"
import Loadable from "react-loadable"
import App from "./components/app"

const MyLoadingComponent = props => {
  if (props.isLoading) {
    // While our other component is loading...
    if (props.timedOut) {
      // In case we've timed out loading our other component.
      return <div>Loader timed out!</div>
    } else if (props.pastDelay) {
      // Display a loading screen after a set delay.
      return <div>Loading...</div>
    } else {
      // Don't flash "Loading..." when we don't need to.
      return null
    }
  } else if (props.error) {
    // If we aren't loading, maybe
    return <div>Error! Component failed to load</div>
  } else {
    // This case shouldn't happen... but we'll return null anyways.
    return null
  }
}

const NomadAllocation = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation" */ "./containers/allocation")
})
const NomadAllocations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation-list" */ "./containers/allocations")
})
const NomadAllocationFiles = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation-files" */ "./components/AllocationFiles/AllocationFiles")
})
const NomadAllocationInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation-info" */ "./components/AllocationInfo/AllocationInfo")
})
const NomadAllocationRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation-raw" */ "./components/AllocationRaw/AllocationRaw")
})
const NomadAllocationStats = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-allocation-stats" */ "./components/AllocationStats/AllocationStats")
})
const NomadClient = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-client" */ "./containers/client")
})
const NomadClientAllocations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () =>
    import(/* webpackChunkName: "nomad-client-allocations" */ "./components/ClientAllocations/ClientAllocations")
})
const NomadClientEvaluations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () =>
    import(/* webpackChunkName: "nomad-client-evaluations" */ "./components/ClientEvaluations/ClientEvaluations")
})
const NomadClientInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-client-info" */ "./components/ClientInfo/ClientInfo")
})
const NomadClientRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-client-raw" */ "./components/ClientRaw/ClientRaw")
})
const NomadClients = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-clients" */ "./containers/clients")
})
const NomadClientStats = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-client-stats" */ "./components/ClientStats/ClientStats")
})
const NomadCluster = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-cluster" */ "./containers/cluster")
})
const ConsulKV = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "consul-kv" */ "./containers/consul_kv")
})
const ConsulNodes = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "consul-nodes" */ "./containers/consul_nodes")
})
const ConsulServices = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "consul-services" */ "./containers/consul_services")
})
const NomadDeployment = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-deployment" */ "./containers/deployment")
})
const NomadDeploymentAllocations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () =>
    import(/* webpackChunkName: "nomad-deployment-allocations" */ "./components/DeploymentAllocations/DeploymentAllocations")
})
const NomadDeploymentInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-deployment-info" */ "./components/DeploymentInfo/DeploymentInfo")
})
const NomadDeploymentRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-deployment-raw" */ "./components/DeploymentRaw/DeploymentRaw")
})
const NomadDeployments = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-deployments" */ "./containers/deployments")
})
const NomadEvaluationAllocations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () =>
    import(/* webpackChunkName: "nomad-evaluation-allocation" */ "./components/EvaluationAllocations/EvaluationAllocations")
})
const NomadEvaluationInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-evaluation-info" */ "./components/EvaluationInfo/EvaluationInfo")
})
const NomadEvaluationRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-evaluation-raw" */ "./components/EvaluationRaw/EvaluationRaw")
})
const NomadEvaluation = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-evaluation" */ "./containers/evaluation")
})
const NomadEvaluations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-evaluations" */ "./containers/evaluations")
})
const NomadJob = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job" */ "./containers/job")
})
const NomadJobAllocations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-allocations" */ "./components/JobAllocations/JobAllocations")
})
const NomadJobChildren = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-children" */ "./components/JobChildren/JobChildren")
})
const NomadJobDeployments = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-deployments" */ "./components/JobDeployments/JobDeployments")
})
const NomadJobEvaluations = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-evaluations" */ "./components/JobEvaluations/JobEvaluations")
})
const NomadJobInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-info" */ "./components/JobInfo/JobInfo")
})
const NomadJobRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-raw" */ "./components/JobRaw/JobRaw")
})
const NomadJobs = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-jobs" */ "./containers/jobs")
})
const NomadJobTaskGroups = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-job-taskgroups" */ "./components/JobTaskGroups/JobTaskGroups")
})
const ConsulSelectRegion = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "consul-select-region" */ "./containers/select_consul_region")
})
const NomadSelectRegion = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-select-region" */ "./containers/select_nomad_region")
})
const NomadServer = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-server" */ "./containers/server")
})
const NomadServerInfo = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-server-info" */ "./components/ServerInfo/ServerInfo")
})
const NomadServerRaw = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-server-raw" */ "./components/ServerRaw/ServerRaw")
})
const NomadServers = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-servers" */ "./containers/servers")
})
const NomadSystem = Loadable({
  delay: 200,
  loading: MyLoadingComponent,
  loader: () => import(/* webpackChunkName: "nomad-system" */ "./containers/system")
})

const AppRouter = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={App}>
      <IndexRedirect to="/nomad/" />
      // Consul
      <Route path="/consul/" component={ConsulSelectRegion} />
      <Redirect from="/consul/:region" to="/consul/:region/services" />
      <Route path="/consul/:region/kv" component={ConsulKV} />
      <Route path="/consul/:region/kv/*" component={ConsulKV} />
      <Route path="/consul/:region/nodes" component={ConsulNodes} />
      <Route path="/consul/:region/nodes/:name" component={ConsulNodes} />
      <Route path="/consul/:region/services" component={ConsulServices} />
      <Route path="/consul/:region/services/:name" component={ConsulServices} />
      // Nomad
      <Route path="/nomad/" component={NomadSelectRegion} />
      <Redirect from="/nomad/:region" to="/nomad/:region/cluster" />
      <Route path="/nomad/:region/cluster" component={NomadCluster} />
      /* servers */
      <Route path="/nomad/:region/servers" component={NomadServers} />
      <Route path="/nomad/:region/servers/:memberId" component={NomadServer}>
        <IndexRedirect to="/nomad/:region/servers/:memberId/info" />
        <Route path="/nomad/:region/servers/:memberId/info" component={NomadServerInfo} />
        <Route path="/nomad/:region/servers/:memberId/raw" component={NomadServerRaw} />
      </Route>
      /* jobs */
      <Route path="/nomad/:region/jobs" component={NomadJobs} />
      <Route path="/nomad/:region/jobs/:jobId" component={NomadJob}>
        <IndexRedirect to="/nomad/:region/jobs/:jobId/info" />
        <Route path="/nomad/:region/jobs/:jobId/info" component={NomadJobInfo} />
        <Route path="/nomad/:region/jobs/:jobId/allocations" component={NomadJobAllocations} />
        <Route path="/nomad/:region/jobs/:jobId/children" component={NomadJobChildren} />
        <Route path="/nomad/:region/jobs/:jobId/deployments" component={NomadJobDeployments} />
        <Route path="/nomad/:region/jobs/:jobId/evaluations" component={NomadJobEvaluations} />
        <Route path="/nomad/:region/jobs/:jobId/groups" component={NomadJobTaskGroups} />
        <Route path="/nomad/:region/jobs/:jobId/raw" component={NomadJobRaw} />
      </Route>
      /* clients */
      <Route path="/nomad/:region/clients" component={NomadClients} />
      <Route path="/nomad/:region/clients/:nodeId" component={NomadClient}>
        <IndexRedirect to="/nomad/:region/clients/:nodeId/info" />
        <Route path="/nomad/:region/clients/:nodeId/info" component={NomadClientInfo} />
        <Route path="/nomad/:region/clients/:nodeId/stats" component={NomadClientStats} />
        <Route path="/nomad/:region/clients/:nodeId/allocations" component={NomadClientAllocations} />
        <Route path="/nomad/:region/clients/:nodeId/evaluations" component={NomadClientEvaluations} />
        <Route path="/nomad/:region/clients/:nodeId/raw" component={NomadClientRaw} />
      </Route>
      /* deployments */
      <Route path="/nomad/:region/deployments" component={NomadDeployments} />
      <Route path="/nomad/:region/deployments/:id" component={NomadDeployment}>
        <IndexRedirect to="/nomad/:region/deployments/:id/info" />
        <Route path="/nomad/:region/deployments/:id/info" component={NomadDeploymentInfo} />
        <Route path="/nomad/:region/deployments/:id/allocations" component={NomadDeploymentAllocations} />
        <Route path="/nomad/:region/deployments/:id/raw" component={NomadDeploymentRaw} />
      </Route>
      /* allocations */
      <Route path="/nomad/:region/allocations" component={NomadAllocations} />
      <Route path="/nomad/:region/allocations/:allocId" component={NomadAllocation}>
        <IndexRedirect to="/nomad/:region/allocations/:allocId/info" />
        <Route path="/nomad/:region/allocations/:allocId/info" component={NomadAllocationInfo} />
        <Route path="/nomad/:region/allocations/:allocId/stats" component={NomadAllocationStats} />
        <Redirect
          from="/nomad/:region/allocations/:allocId/logs"
          to="/nomad/:region/allocations/:allocId/files"
          query={{ path: "/alloc/logs/" }}
        />
        <Route path="/nomad/:region/allocations/:allocId/files" component={NomadAllocationFiles} query={{ path: "" }} />
        <Route path="/nomad/:region/allocations/:allocId/raw" component={NomadAllocationRaw} />
      </Route>
      /* evaluations */
      <Route path="/nomad/:region/evaluations" component={NomadEvaluations} />
      <Route path="/nomad/:region/evaluations/:evalId" component={NomadEvaluation}>
        <IndexRedirect to="/nomad/:region/evaluations/:evalId/info" />
        <Route path="/nomad/:region/evaluations/:evalId/info" component={NomadEvaluationInfo} />
        <Route path="/nomad/:region/evaluations/:evalId/allocations" component={NomadEvaluationAllocations} />
        <Route path="/nomad/:region/evaluations/:evalId/raw" component={NomadEvaluationRaw} />
      </Route>
      /* system */
      <Route path="/nomad/:region/system" component={NomadSystem} />
    </Route>
  </Router>
)

AppRouter.propTypes = {
  history: PropTypes.instanceOf(browserHistory.constructor).isRequired
}

export default AppRouter
