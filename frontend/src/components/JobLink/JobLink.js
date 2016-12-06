import React, { PureComponent, PropTypes } from 'react'
import { Link } from 'react-router'

class JobLink extends PureComponent {

  render () {
    const jobId = this.props.jobId
    const JobIdUrl = encodeURIComponent(jobId)
    const taskId = this.props.taskId
    const taskGroupId = this.props.taskGroupId

    let linkAppend = this.props.linkAppend
    let children = this.props.children

    if (taskId) {
      if (!taskGroupId) {
        throw new ('Cant link to a job taskId without a taskGroupId')
      }

      linkAppend = linkAppend + '/tasks'
    }

    if (taskGroupId) {
      linkAppend = linkAppend + '/taskGroups'
    }

    if (children === undefined) {
      children = jobId
    }

    return <Link to={{ pathname: `/jobs/${JobIdUrl}${linkAppend}`, query: { taskGroupId, taskId } }}>{ children }</Link>
  }
}

JobLink.defaultProps = {
  linkAppend: ''
}

JobLink.propTypes = {
  children: PropTypes.array,
  jobId: PropTypes.string.isRequired,
  taskId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  taskGroupId: PropTypes.string
}

export default JobLink
