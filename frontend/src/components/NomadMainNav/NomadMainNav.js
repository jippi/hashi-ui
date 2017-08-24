import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { List, ListItem, makeSelectable } from "material-ui/List"

const SelectableList = makeSelectable(List)

class NomadMainNav extends PureComponent {
  constructor() {
    super()
    this._onClick = this.setActiveMenu.bind(this)
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

      case "deployments":
        route = `${prefix}/deployments`
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

      case "system":
        route = `${prefix}/system`
        break

      default:
        route = `${prefix}/cluster`
    }

    return route
  }

  setActiveMenu(e, index) {
    this.props.router.push(this.getRoute(index))
  }

  getActiveMenu() {
    const location = this.props.location

    const prefix = `/nomad/${this.props.router.params.region}`

    if (location.pathname.startsWith(prefix + "/cluster")) {
      return "cluster"
    }

    if (location.pathname.startsWith(prefix + "/jobs")) {
      return "jobs"
    }

    if (location.pathname.startsWith(prefix + "/deployments")) {
      return "deployments"
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

    if (location.pathname.startsWith(prefix + "/system")) {
      return "system"
    }

    return "cluster"
  }

  tabs() {
    let clickHandler = x => {
      return e => {
        // allow cmd/shift/ctrl key to open link in new tab without changing navigation in current page
        if (
          e.ctrlKey ||
          e.shiftKey ||
          e.metaKey || // apple
          (e.button && e.button == 1) // middle click, >IE9 + everyone else
        ) {
          return false
        }

        // don't trigger the normal href
        e.preventDefault()

        // push the new URL through redux
        this.setActiveMenu(e, x)

        return false
      }
    }

    return (
      <SelectableList value={this.getActiveMenu()}>
        <ListItem
          key="cluster"
          primaryText="Cluster"
          value="cluster"
          href={this.getRoute("cluster")}
          onClick={clickHandler("cluster")}
        />
        <ListItem
          key="jobs"
          primaryText="Jobs"
          value="jobs"
          href={this.getRoute("jobs")}
          onClick={clickHandler("jobs")}
        />
        <ListItem
          key="deployments"
          primaryText="Deployments"
          value="deployments"
          href={this.getRoute("deployments")}
          onClick={clickHandler("deployments")}
        />
        <ListItem
          key="allocations"
          primaryText="Allocations"
          value="allocations"
          href={this.getRoute("allocations")}
          onClick={clickHandler("allocations")}
        />
        <ListItem
          key="evaluations"
          primaryText="Evaluations"
          value="evaluations"
          href={this.getRoute("evaluations")}
          onClick={clickHandler("evaluations")}
        />
        <ListItem
          key="clients"
          primaryText="Clients"
          value="clients"
          href={this.getRoute("clients")}
          onClick={clickHandler("clients")}
        />
        <ListItem
          key="servers"
          primaryText="Servers"
          value="servers"
          href={this.getRoute("servers")}
          onClick={clickHandler("servers")}
        />
        <ListItem
          key="system"
          primaryText="System"
          value="system"
          href={this.getRoute("system")}
          onClick={clickHandler("system")}
        />
      </SelectableList>
    )
  }

  render() {
    return "region" in this.props.router.params ? this.tabs() : null
  }
}

NomadMainNav.defaultProps = {}

NomadMainNav.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(withRouter(NomadMainNav))
