import React, { PropTypes } from 'react'
import { Link, withRouter } from 'react-router'

const JobLink = ({ children, jobId, linkAppend, taskGroupId, taskId, router }) => {

  const JobIdUrl = encodeURIComponent(jobId)

  if (taskGroupId) {
    linkAppend = linkAppend + '/groups'
  }

  if (children === undefined) {
    children = jobId
  }

  if (!linkAppend) {
    linkAppend = '/info'
  }

  const query = {
    taskGroupId,
    taskId
  }

  const to = {
    pathname: `/nomad/${router.params.region}/jobs/${JobIdUrl}${linkAppend}`,
    query
  }

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
  taskId: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
}

export default withRouter(JobLink)
