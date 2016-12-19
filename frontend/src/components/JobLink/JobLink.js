import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const JobLink = ({ children, jobId, linkAppend, taskGroupId, taskId }) => {

  const JobIdUrl = encodeURIComponent(jobId)

  if (taskGroupId) {
    linkAppend = linkAppend + '/taskGroups'
  }

  if (children === undefined) {
    children = jobId
  }

  const query = {
    taskGroupId,
    taskId
  }

  const to = {
    pathname: '/jobs/' + JobIdUrl + linkAppend,
    query
  }

  console.log(to)

  return (
    <Link to={ to }>
      { children }
    </Link>
  )
}

JobLink.defaultProps = {
  linkAppend: ''
}

JobLink.propTypes = {
  children: PropTypes.array,
  jobId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  taskGroupId: PropTypes.string,
  taskId: PropTypes.string.isRequired
}

export default JobLink
