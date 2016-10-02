import React, { PropTypes } from 'react';
import { Glyphicon } from 'react-bootstrap';

const Boolean = ({
    title,
    value,
    withIcon,
    withText,
    withColor,
    trueText,
    falseText,
    falseIcon,
    trueIcon,
}) => {
    let colorClass;
    let icon;
    let text;

    if (withColor) {
        colorClass = this.value ? 'text-success' : 'text-danger';
    }

    if (withIcon) {
        icon = <Glyphicon glyph={ value ? trueIcon : falseIcon } />;
    }

    if (withText) {
        text = <span>{ value ? trueText : falseText }</span>;
    }

    return (
      <span title={ title } className={ colorClass }>{ icon } { text }</span>
    );
};

Boolean.defaultProps = {
    value: null,
    title: null,

    withColor: true,
    withIcon: true,
    withText: false,

    trueText: 'yes',
    trueIcon: 'ok',

    falseText: 'no',
    falseIcon: 'remove',
};

Boolean.propTypes = {
    value: PropTypes.isRequired,
    title: PropTypes.isRequired,

    withColor: PropTypes.isRequired,
    withIcon: PropTypes.isRequired,
    withText: PropTypes.isRequired,

    trueText: PropTypes.isRequired,
    trueIcon: PropTypes.isRequired,

    falseText: PropTypes.isRequired,
    falseIcon: PropTypes.isRequired,
};

export default Boolean;
