import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { List, ListItem, makeSelectable } from "material-ui/List"

const SelectableList = makeSelectable(List)

class ConsulMainNav extends PureComponent {
  getRoute(index) {
    const prefix = `/consul/${this.props.router.params.region}`
    let route = prefix

    switch (index) {
      case "services":
        route = `${prefix}/services`
        break

      case "kv":
        route = `${prefix}/kv`
        break

      case "nodes":
        route = `${prefix}/nodes`
        break

      default:
        route = `${prefix}/services`
    }

    return route
  }

  setActiveMenu(e, index) {
    this.props.router.push(this.getRoute(index))
  }

  getActiveMenu() {
    const location = this.props.location

    const prefix = `/consul/${this.props.router.params.region}`

    if (location.pathname.startsWith(prefix + "/services")) {
      return "services"
    }

    if (location.pathname.startsWith(prefix + "/kv")) {
      return "kv"
    }

    if (location.pathname.startsWith(prefix + "/nodes")) {
      return "nodes"
    }

    return "services"
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
          key="services"
          primaryText="Services"
          value="services"
          href={this.getRoute("services")}
          onClick={clickHandler("services")}
        />
        <ListItem key="kv" primaryText="KV" value="kv" href={this.getRoute("kv")} onClick={clickHandler("kv")} />
        <ListItem
          key="nodes"
          primaryText="Nodes"
          value="nodes"
          href={this.getRoute("nodes")}
          onClick={clickHandler("nodes")}
        />
      </SelectableList>
    )
  }

  render() {
    return "region" in this.props.router.params ? this.tabs() : null
  }
}

ConsulMainNav.defaultProps = {}

ConsulMainNav.propTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(withRouter(ConsulMainNav))
