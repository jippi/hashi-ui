import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { default as shortenUUID } from '../../helpers/uuid'

const AllocationLink = ({ children, allocationId, linkAppend, shortUUID, linkQuery }) => {
  let innerChildren = children;

  if (children === undefined) {
    innerChildren = shortUUID ? shortenUUID(allocationId) : allocationId
  }

  return (
    <Link to={{ pathname: `/nomad/allocations/${allocationId}${linkAppend}`, query: linkQuery}}>
      { innerChildren }
    </Link>
  )
}

AllocationLink.defaultProps = {
  shortUUID: true,
  linkAppend: '',
  linkQuery: {},
}

AllocationLink.propTypes = {
  children: PropTypes.array,
  allocationId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  linkQuery: PropTypes.object,
  shortUUID: PropTypes.boolean.isRequired
}

export default AllocationLink
