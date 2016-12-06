import React, { PropTypes } from 'react'
import { Glyphicon } from 'react-bootstrap'

const FormatBoolean = ({
    title,
    value,
    withIcon,
    withText,
    withColor,
    trueText,
    falseText,
    falseIcon,
    trueIcon
}) => {
  let colorClass
  let icon
  let text

  if (withColor) {
    colorClass = value ? 'text-success' : 'text-danger'
  }

  if (withIcon) {
    icon = <Glyphicon glyph={ value ? trueIcon : falseIcon } />
  }

  if (withText) {
    text = <span>{ value ? trueText : falseText }</span>
  }

  return (
    <span title={ title } className={ colorClass }>{ icon } { text }</span>
  )
}

FormatBoolean.defaultProps = {
  value: null,
  title: null,

  withColor: true,
  withIcon: true,
  withText: false,

  trueText: 'yes',
  trueIcon: 'ok',

  falseText: 'no',
  falseIcon: 'remove'
}

FormatBoolean.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string,

  withColor: PropTypes.bool.isRequired,
  withIcon: PropTypes.bool.isRequired,
  withText: PropTypes.bool.isRequired,

  trueText: PropTypes.string.isRequired,
  trueIcon: PropTypes.string.isRequired,

  falseText: PropTypes.string.isRequired,
  falseIcon: PropTypes.string.isRequired
}

export default FormatBoolean
