import React, { PureComponent, PropTypes } from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { List, ListItem, makeSelectable } from "material-ui/List"

const SelectableList = makeSelectable(List)

class NomadMainNav extends PureComponent {
  constructor() {
    super()
    this._onClick = this.handleActive.bind(this)
  }

  getRoute(index) {
    const prefix = `/nomad/${this.props.router.params.region}`
    let route = prefix

    switch (index) {
      case "cluster":
        route = `${prefix}/cluster`
        break

      case "jobs":
        route = `${prefix}/jobs`
        break

      case "allocations":
        route = `${prefix}/allocations`
        break

      case "evaluations":
        route = `${prefix}/evaluations`
        break

      case "clients":
        route = `${prefix}/clients`
        break

      case "servers":
        route = `${prefix}/servers`
        break

      default:
        route = `${prefix}/cluster`
    }

    return route
  }

  handleActive(a, index) {
    this.props.router.push(this.getRoute(index))
  }

  getActiveTab() {
    const location = this.props.location

    const prefix = `/nomad/${this.props.router.params.region}`

    if (location.pathname.startsWith(prefix + "/cluster")) {
      return "cluster"
    }

    if (location.pathname.startsWith(prefix + "/jobs")) {
      return "jobs"
    }

    if (location.pathname.startsWith(prefix + "/allocations")) {
      return "allocations"
    }

    if (location.pathname.startsWith(prefix + "/evaluations")) {
      return "evaluations"
    }

    if (location.pathname.startsWith(prefix + "/clients")) {
      return "clients"
    }

    if (location.pathname.startsWith(prefix + "/servers")) {
      return "servers"
    }

    return "cluster"
  }

  tabs() {
    let nope = e => {
      e.preventDefault()
      return false
    }

    return (
      <SelectableList value={this.getActiveTab()} onChange={this._onClick}>
        <ListItem primaryText="Cluster" value="cluster" href={this.getRoute("cluster")} onClick={nope} />
        <ListItem primaryText="Jobs" value="jobs" href={this.getRoute("jobs")} onClick={nope} />
        <ListItem primaryText="Allocations" value="allocations" href={this.getRoute("allocations")} />
        <ListItem primaryText="Evaluations" value="evaluations" href={this.getRoute("evaluations")} />
        <ListItem primaryText="Clients" value="clients" href={this.getRoute("clients")} />
        <ListItem primaryText="Servers" value="servers" href={this.getRoute("servers")} />
      </SelectableList>
    )
  }

  render() {
    return "region" in this.props.router.params ? this.tabs() : undefined
  }
}

NomadMainNav.defaultProps = {}

NomadMainNav.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(withRouter(NomadMainNav))
