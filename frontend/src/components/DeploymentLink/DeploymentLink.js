import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { Link, withRouter } from "react-router"
import shortUUID from "../../helpers/uuid"

class DeploymentLink extends PureComponent {
  render() {
    const deploymentId = this.props.deploymentId
    let linkAppend = this.props.linkAppend
    let children = this.props.children

    if (children === undefined) {
      children = this.props.shortUUID ? shortUUID(deploymentId) : deploymentId
    }

    if (!linkAppend) {
      linkAppend = "/info"
    }

    return (
      <Link
        to={{
          pathname: `/nomad/${this.props.router.params.region}/deployments/${deploymentId}${linkAppend}`
        }}
      >
        {children}
      </Link>
    )
  }
}

DeploymentLink.defaultProps = {
  shortUUID: true,
  linkAppend: ""
}

DeploymentLink.propTypes = {
  children: PropTypes.array,
  deploymentId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(DeploymentLink)
