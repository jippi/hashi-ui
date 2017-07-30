import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { Link, withRouter } from "react-router"
import shortUUID from "../../helpers/uuid"

class ServerLink extends PureComponent {
  render() {
    const linkAppend = this.props.linkAppend
    const serverId = this.props.serverId
    let children = this.props.children

    if (children === undefined) {
      children = this.props.shortUUID ? shortUUID(serverId) : serverId
    }

    return (
      <Link
        to={{
          pathname: `/nomad/${this.props.router.params.region}/servers/${serverId}${linkAppend}`
        }}
      >
        {children}
      </Link>
    )
  }
}

ServerLink.defaultProps = {
  shortUUID: true,
  linkAppend: ""
}

ServerLink.propTypes = {
  children: PropTypes.array,
  linkAppend: PropTypes.string,
  serverId: PropTypes.string.isRequired,
  shortUUID: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(ServerLink)
