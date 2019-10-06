import React from "react"
import PropTypes from "prop-types"
import { blue, green, red } from '@material-ui/core/colors';
const blue500 = blue['500'];
const green500 = green['500'];
const red500 = red['500'];

const NodeStatus = ({ value }) => {
  switch (value) {
    case "initializing":
      return <span style={{ color: blue500 }}>initializing</span>

    case "ready":
      return <span style={{ color: green500 }}>ready</span>

    case "down":
      return <span style={{ color: red500 }}>down</span>

    default:
      return (
        <span>
          {value}
        </span>
      )
  }
}

NodeStatus.defaultProps = {
  value: null
}

NodeStatus.propTypes = {
  value: PropTypes.string.isRequired
}

export default NodeStatus
