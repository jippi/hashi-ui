import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link, withRouter } from "react-router"
import shortUUID from "../../helpers/uuid"

class ClientLink extends PureComponent {
  render() {
    const clientId = this.props.clientId
    let linkAppend = this.props.linkAppend
    let children = this.props.children

    if (children === undefined) {
      if (this.props.client.Name) {
        children = this.props.client.Name
      }

      if (!children) {
        children = this.props.shortUUID ? shortUUID(clientId) : clientId
      }
    }

    if (!linkAppend) {
      linkAppend = "/info"
    }

    return (
      <Link
        to={{
          pathname: `/nomad/${this.props.router.params.region}/clients/${clientId}${linkAppend}`
        }}
      >
        {children}
      </Link>
    )
  }
}

ClientLink.defaultProps = {
  client: {},
  shortUUID: true,
  linkAppend: ""
}

ClientLink.propTypes = {
  children: PropTypes.array,
  clientId: PropTypes.string.isRequired,
  client: PropTypes.object,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired
}

const clientLookupCache = {}
const findClientById = (clientId, clients) => {
  if (clientId in clientLookupCache) {
    return clientLookupCache[clientId]
  }

  const r = Object.keys(clients).filter(node => clients[node].ID === clientId)

  if (r.length !== 0) {
    clientLookupCache[clientId] = clients[r]
  } else {
    clientLookupCache[clientId] = false
  }

  return clientLookupCache[clientId]
}

function mapStateToProps({}, { clients, client, clientId, ...ownProps }) {
  let resp = { client, clientId, ...ownProps }

  if (!client && clientId && clients.length > 0) {
    resp["client"] = findClientById(clientId, clients)
  }

  return resp
}

export default connect(mapStateToProps)(withRouter(ClientLink))
