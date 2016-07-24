import React, { Component } from 'react'
import JSONFormatter from 'json-formatter-js'

class JSON extends Component {

    componentDidMount () {
        const formatter = new JSONFormatter(this.props.json, 2, {
            hoverPreviewEnabled: true,
            hoverPreviewArrayCount: 100,
            hoverPreviewFieldCount: 5,
        });
        this.refs.json.appendChild(formatter.render());
    }

    componentDidUpdate () {
        const formatter = new JSONFormatter(this.props.json, 2, {
            hoverPreviewEnabled: true,
            hoverPreviewArrayCount: 100,
            hoverPreviewFieldCount: 5,
        });

        // Remove the old JSON
        if (this.refs.json.hasChildNodes()) {
            this.refs.json.removeChild(this.refs.json.childNodes[0]);
        }
        // Add the new JSON
        this.refs.json.appendChild(formatter.render());
    }

    render () {
        return (
            <div id="raw_json" ref={'json'}></div>
        );
    }
}

export default JSON;
