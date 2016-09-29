import React, { Component } from 'react';
import { Link } from 'react-router';
import shortUUID from '../helpers/uuid'

export class NomadLink extends Component {

    findNodeNameById(nodeId) {
        let r = Object.keys(this.props.nodeList).filter(_ => { return this.props.nodeList[_]['ID'] === nodeId; })
        if (r) {
            return this.props.nodeList[r].Name;
        }

        return 'n/a';
    }

    render() {
        const short = this.props.short === 'true'

        let children = this.props.children
        let linkProps = Object.assign({}, this.props)
        Object.keys(linkProps).filter(_ => {return _.endsWith('Id')}).forEach(k => {
            delete linkProps[k]
        })
        delete linkProps['short']
        delete linkProps['nodeList']

        // member
        if (this.props.memberId !== undefined) {
            const memberId = this.props.memberId
            if (children === undefined) {
                children = short ? shortUUID(memberId) : memberId
            }
            return (
                <Link {...linkProps} to={`/members/${memberId}`}>{children}</Link>
            )
        }

        // node
        if (this.props.nodeId !== undefined) {
            const nodeId = this.props.nodeId
            if (children === undefined) {
                if (this.props.nodeList) {
                    children = this.findNodeNameById(this.props.nodeId)
                } else {
                    children = short ? shortUUID(this.props.nodeId) : nodeId
                }
            }
            return (
                <Link {...linkProps} to={`/nodes/${nodeId}`}>{children}</Link>
            )
        }

        // eval
        if (this.props.evalId !== undefined) {
            const evalId = this.props.evalId
            if (children === undefined) {
                children = short ? shortUUID(evalId) : evalId
            }
            return (
                <Link {...linkProps} to={`/evaluations/${evalId}`}>{children}</Link>
            )
        }

        // alloc
        if (this.props.allocId !== undefined) {
            const allocId = this.props.allocId
            if (children === undefined) {
                children = short ? shortUUID(allocId) : allocId
            }
            return (
                <Link {...linkProps} to={`/allocations/${allocId}`}>{children}</Link>
            )
        }

        // tasks
        if (this.props.taskId !== undefined) {
            if (this.props.jobId !== undefined && this.props.taskGroupId !== undefined) {
                const jobId = this.props.jobId
                const taskGroupId = this.props.taskGroupId
                const taskId = this.props.taskId

                if (children === undefined) {
                    children = short ? shortUUID(taskId) : taskId
                }
                return (
                    <Link {...linkProps} to={`/jobs/${jobId}/tasks`}
                                         query={{taskGroupId: taskGroupId, taskId: taskId}}>{children}</Link>
                )
            } else {
                console.error('NomadLink: You must also provide taskGroupId and jobId for task links!')
            }
        }

        // taskGroup (must be after task)
        if (this.props.taskGroupId !== undefined) {
            if (this.props.jobId !== undefined) {
                const jobId = this.props.jobId
                const taskGroupId = this.props.taskGroupId

                if (children === undefined) {
                    children = short ? shortUUID(taskGroupId) : taskGroupId
                }
                return (
                    <Link {...linkProps} to={`/jobs/${jobId}/taskGroups`}
                                         query={{taskGroupId: taskGroupId}}>{children}</Link>
                )
            } else {
                console.error('NomadLink: You must also provide jobId for taskGroup links!')
            }
        }

        // job (must be after task & taskGroup
        if (this.props.jobId !== undefined) {
            const jobId = this.props.jobId

            if (children === undefined) {
                children = short ? shortUUID(jobId) : jobId
            }
            return (
                <Link {...linkProps} to={`/jobs/${jobId}`}>{children}</Link>
            )
        }

        // nothing by default
        return null
    }
}
