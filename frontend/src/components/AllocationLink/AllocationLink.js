import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { default as shortenUUID } from '../../helpers/uuid'

const AllocationLink = ({ children, allocationId, linkAppend, shortUUID }) => {
  let innerChildren = children;

  if (children === undefined) {
    innerChildren = shortUUID ? shortenUUID(allocationId) : allocationId
  }

  return (
    <Link to={{ pathname: `/allocations/${allocationId}${linkAppend}` }}>
      { innerChildren }
    </Link>
  )
}

AllocationLink.defaultProps = {
  shortUUID: true,
  linkAppend: ''
}

AllocationLink.propTypes = {
  children: PropTypes.array,
  allocationId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.boolean.isRequired
}

export default AllocationLink
