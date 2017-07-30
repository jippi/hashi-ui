import React from "react"
import PropTypes from "prop-types"
import { Link, withRouter } from "react-router"
import { default as shortenUUID } from "../../helpers/uuid"

const AllocationLink = ({ children, allocationId, linkAppend, shortUUID, linkQuery, router }) => {
  let innerChildren = children

  if (children === undefined) {
    innerChildren = shortUUID ? shortenUUID(allocationId) : allocationId
  }

  if (!linkAppend) {
    linkAppend = "/info"
  }

  return (
    <Link
      to={{
        pathname: `/nomad/${router.params.region}/allocations/${allocationId}${linkAppend}`,
        query: linkQuery
      }}
    >
      {innerChildren}
    </Link>
  )
}

AllocationLink.defaultProps = {
  shortUUID: true,
  linkAppend: "",
  linkQuery: {}
}

AllocationLink.propTypes = {
  children: PropTypes.any,
  allocationId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  linkQuery: PropTypes.object,
  shortUUID: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(AllocationLink)
