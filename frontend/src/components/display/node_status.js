import React, { Component } from 'react';
import DisplayBoolean from './boolean'

class NodeStatus extends Component {

    render() {
        switch (this.props.value) {
            case "initializing":
                return (<span>initializing</span>)

            case "ready":
                return (<DisplayBoolean value={true} title={this.props.value} />)

            case "down":
                return (<DisplayBoolean value={false} title={this.props.value} />)

            default:
                return (<span>{this.props.value}</span>)
        }
    }
}

NodeStatus.defaultProps = {
    value: null,
    title: null,
};


export default NodeStatus
