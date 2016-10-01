import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap'

class DisplayBoolean extends Component {

    render() {
    	let colorClass, icon, text;

    	if (this.props.withColor) {
    		colorClass = this.props.value ? 'text-success' : 'text-danger';
    	}

    	if (this.props.withIcon) {
    		icon = <Glyphicon glyph={this.props.value ? this.props.trueIcon : this.props.falseIcon} />
    	}

    	if (this.props.withText) {
			text = <span>{this.props.value ? this.props.trueText : this.props.falseText}</span>
    	}

        return (
            <span title={this.props.title} className={colorClass}>{icon} {text}</span>
        )
    }
}

DisplayBoolean.defaultProps = {
    value: null,
    title: null,

    withColor: true,
    withIcon: true,
    withText: false,

    trueText: 'yes',
    trueIcon: 'ok',

    falseText: 'no',
    falseIcon: 'remove'
};


export default DisplayBoolean
