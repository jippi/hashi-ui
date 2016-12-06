import React, { PureComponent, PropTypes } from 'react'
import { Link } from 'react-router'
import shortUUID from '../../helpers/uuid'

class AllocationLink extends PureComponent {

  render () {
    const linkAppend = this.props.linkAppend
    const allocationId = this.props.allocationId
    let children = this.props.children

    if (children === undefined) {
      children = this.props.shortUUID ? shortUUID(allocationId) : allocationId
    }

    return <Link to={{ pathname: `/allocations/${allocationId}${linkAppend}` }}>{ children }</Link>
  }
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
