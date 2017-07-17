import React, { PropTypes } from "react"
import AppendedReactTooltip from "../AppendedReactTooltip/AppendedReactTooltip"
// eslint-disable-next-line no-unused-vars
import momentDurationFormat from "moment-duration-format"
import moment from "moment"
import getMoment from "../../helpers/time"

const FormatTime = ({ time, now, identifier, display, timeFormat, durationInterval, durationFormat }) => {
  const _time = getMoment(time)
  const _now = getMoment(now)

  let timeDiff = undefined

  if (durationInterval && durationFormat) {
    timeDiff = moment.duration(_time.diff(_now), durationInterval).format(durationFormat, { forceLength: true })
  } else {
    timeDiff = _time.from(_now, true)
  }

  if (display === "relative") {
    return (
      <span>
        <AppendedReactTooltip id={`time-${identifier}`}>
          {_time.format(timeFormat)}
        </AppendedReactTooltip>
        <span data-tip data-for={`time-${identifier}`}>
          {timeDiff}
        </span>
      </span>
    )
  }

  return (
    <span>
      <AppendedReactTooltip id={`time-${identifier}`}>
        {timeDiff}
      </AppendedReactTooltip>
      <span data-tip data-for={`time-${identifier}`}>
        {_time.format(timeFormat)}
      </span>
    </span>
  )
}

FormatTime.defaultProps = {
  time: null,
  now: "now",
  display: "relative",
  timeFormat: "DD-MM-YYYY H:mm:ss",
  durationInterval: null,
  durationFormat: null
}

FormatTime.propTypes = {
  time: PropTypes.number.isRequired,
  now: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  identifier: PropTypes.string.isRequired,
  display: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  durationInterval: PropTypes.string,
  durationFormat: PropTypes.string
}

export default FormatTime
