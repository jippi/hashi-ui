import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const JobLink = ({ children, jobId, linkAppend, taskGroupId, taskId }) => {

  const JobIdUrl = encodeURIComponent(jobId)

  if (taskId) {
    if (!taskGroupId) {
      throw new Error('Cant link to a job taskId without a taskGroupId')
    }

    linkAppend = linkAppend + '/tasks'
  }

  if (taskGroupId) {
    linkAppend = linkAppend + '/taskGroups'
  }

  if (children === undefined) {
    children = jobId
  }

  return (
    <Link to={{ pathname: `/jobs/${JobIdUrl}${linkAppend}`, query: { taskGroupId, taskId } }}>
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
