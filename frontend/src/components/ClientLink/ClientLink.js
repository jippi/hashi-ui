import React, { PureComponent, PropTypes } from 'react'
import { Link, withRouter } from 'react-router'
import shortUUID from '../../helpers/uuid'

const clientLookupCache = {}

const findClientNameById = (clientId, clients) => {
  if (clientId in clientLookupCache) {
    return clientLookupCache[clientId]
  }

  const r = Object.keys(clients).filter(node => clients[node].ID === clientId)

  if (r.length !== 0) {
    clientLookupCache[clientId] = clients[r].Name
  } else {
    clientLookupCache[clientId] = false
  }

  return clientLookupCache[clientId]
}

class ClientLink extends PureComponent {

  render () {
    const linkAppend = this.props.linkAppend
    const clientId = this.props.clientId
    let children = this.props.children

    if (children === undefined) {
      if (this.props.clients.length > 0) {
        children = findClientNameById(clientId, this.props.clients)
      }

      if (!children) {
        children = this.props.shortUUID ? shortUUID(clientId) : clientId
      }
    }

    return (
      <Link
        to={{ pathname: `/nomad/${this.props.router.params.region}/clients/${clientId}${linkAppend}` }}
      >
        { children }
      </Link>
    )
  }
}

ClientLink.defaultProps = {
  clients: [],
  shortUUID: true,
  linkAppend: ''
}

ClientLink.propTypes = {
  children: PropTypes.array,
  clientId: PropTypes.string.isRequired,
  clients: PropTypes.array.isRequired,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.boolean.isRequired,
  router: PropTypes.object.isRequired,
}

export default withRouter(ClientLink)
