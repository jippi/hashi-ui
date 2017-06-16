import React, { PureComponent, PropTypes } from "react"
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
          primaryText="Cluster"
          value="cluster"
          href={this.getRoute("cluster")}
          onClick={clickHandler("cluster")}
        />
        <ListItem primaryText="Jobs" value="jobs" href={this.getRoute("jobs")} onClick={clickHandler("jobs")} />
        <ListItem
          primaryText="Allocations"
          value="allocations"
          href={this.getRoute("allocations")}
          onClick={clickHandler("allocations")}
        />
        <ListItem
          primaryText="Evaluations"
          value="evaluations"
          href={this.getRoute("evaluations")}
          onClick={clickHandler("evaluations")}
        />
        <ListItem
          primaryText="Clients"
          value="clients"
          href={this.getRoute("clients")}
          onClick={clickHandler("clients")}
        />
        <ListItem
          primaryText="Servers"
          value="servers"
          href={this.getRoute("servers")}
          onClick={clickHandler("servers")}
        />
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
