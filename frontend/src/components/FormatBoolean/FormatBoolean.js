import React, { PropTypes } from 'react'
import FontIcon from 'material-ui/FontIcon'
import { green500, red500 } from 'material-ui/styles/colors'

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
  let color
  let icon
  let text

  if (withColor) {
    color = value ? green500 : red500
  }

  if (withIcon) {
    icon = <FontIcon className='material-icons' style={{ color }}>{ value ? trueIcon : falseIcon }</FontIcon>
  }

  if (withText) {
    text = <span>{ value ? trueText : falseText }</span>
  }

  return (
    <span title={ title }>{ icon } { text }</span>
  )
}

FormatBoolean.defaultProps = {
  value: null,
  title: null,

  withColor: true,
  withIcon: true,
  withText: false,

  trueText: 'yes',
  trueIcon: 'check',

  falseText: 'no',
  falseIcon: 'close'
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
