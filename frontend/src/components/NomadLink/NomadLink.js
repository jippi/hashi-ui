import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import shortUUID from '../../helpers/uuid';

let nodeIdToNameCache = {};

function NomadLinkException(message) {
  this.message = message;
  this.name = 'NomadLinkException';
}

export default class NomadLink extends Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeList !== this.props.nodeList) {
      nodeIdToNameCache = {};
    }
  }

  findNodeNameById(nodeId) {
    if (nodeId in nodeIdToNameCache) {
      return nodeIdToNameCache[nodeId];
    }

    const r = Object.keys(this.props.nodeList)
            .filter(node =>
                this.props.nodeList[node].ID === nodeId
            );

    if (r.length !== 0) {
      nodeIdToNameCache[nodeId] = this.props.nodeList[r].Name;
    } else {
      nodeIdToNameCache[nodeId] = false;
    }

    return nodeIdToNameCache[nodeId];
  }

  render() {
    const short = this.props.short === 'true';
    const linkAppend = this.props.linkAppend || '';

    let children = this.props.children;
    const linkProps = Object.assign({}, this.props);
    Object.keys(linkProps)
      .filter(key => key.endsWith('Id'))
      .forEach((key) => {
        delete linkProps[key];
      });

    delete linkProps.short;
    delete linkProps.nodeList;
    delete linkProps.linkAppend;

    // member
    if (this.props.memberId !== undefined) {
      const memberId = this.props.memberId;

      if (children === undefined) {
        children = short ? shortUUID(memberId) : memberId;
      }

      return (<Link { ...linkProps } to={ `/servers/${memberId}` }>{ children }</Link>);
    }

    // node
    if (this.props.nodeId !== undefined) {
      const nodeId = this.props.nodeId;
      if (children === undefined) {
        if (this.props.nodeList) {
          children = this.findNodeNameById(this.props.nodeId);
        }

        if (!children) {
          children = short ? shortUUID(nodeId) : nodeId;
        }
      }

      return (<Link { ...linkProps } to={ `/clients/${nodeId}${linkAppend}` }>{ children }</Link>);
    }

    // eval
    if (this.props.evalId !== undefined) {
      const evalId = this.props.evalId;

      if (children === undefined) {
        children = short ? shortUUID(evalId) : evalId;
      }

      return (<Link { ...linkProps } to={ `/evaluations/${evalId}${linkAppend}` }>{ children }</Link>);
    }

    // alloc
    if (this.props.allocId !== undefined) {
      const allocId = this.props.allocId;
      if (children === undefined) {
        children = short ? shortUUID(allocId) : allocId;
      }

      return (<Link { ...linkProps } to={ `/allocations/${allocId}${linkAppend}` }>{ children }</Link>);
    }

    // tasks
    if (this.props.taskId !== undefined) {
      if (this.props.jobId !== undefined && this.props.taskGroupId !== undefined) {
        const jobId = this.props.jobId;
        const jobIdUrl = encodeURIComponent(jobId);
        const taskGroupId = this.props.taskGroupId;
        const taskId = this.props.taskId;

        if (children === undefined) {
          children = short ? shortUUID(taskId) : taskId;
        }
        return (
          <Link { ...linkProps } to={ `/jobs/${jobIdUrl}/tasks${linkAppend}` } query={{ taskGroupId, taskId }} >
            { children }
          </Link>
        );
      }

      throw new NomadLinkException('NomadLink: You must also provide taskGroupId and jobId for task links!');
    }

    // taskGroup (must be after task)
    if (this.props.taskGroupId !== undefined) {
      if (this.props.jobId !== undefined) {
        const jobId = this.props.jobId;
        const jobIdUrl = encodeURIComponent(jobId);
        const taskGroupId = this.props.taskGroupId;

        if (children === undefined) {
          children = short ? shortUUID(taskGroupId) : taskGroupId;
        }

        return (
          <Link { ...linkProps } to={ `/jobs/${jobIdUrl}/taskGroups${linkAppend}` } query={{ taskGroupId }} >
            { children }
          </Link>
        );
      }

      throw new NomadLinkException('NomadLink: You must also provide jobId for taskGroup links!');
    }

    // job (must be after task & taskGroup
    if (this.props.jobId !== undefined) {
      const jobId = this.props.jobId;
      const jobIdUrl = encodeURIComponent(jobId);

      if (children === undefined) {
        children = short ? shortUUID(jobId) : jobId;
      }

      return (<Link { ...linkProps } to={ `/jobs/${jobIdUrl}${linkAppend}` }>{ children }</Link>);
    }

    console.log(this.props);
    throw new NomadLinkException('NomadLink: Unable to generate a link (check console for props)');
  }
}

NomadLink.propTypes = {
  nodeList: PropTypes.array,
  short: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    React.PropTypes.node,
  ]),
  memberId: PropTypes.string,
  nodeId: PropTypes.string,
  evalId: PropTypes.string,
  allocId: PropTypes.string,
  taskId: PropTypes.string,
  jobId: PropTypes.string,
  linkAppend: PropTypes.string,
  taskGroupId: PropTypes.string,
};
