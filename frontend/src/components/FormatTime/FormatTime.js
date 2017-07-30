import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import AppendedReactTooltip from "../AppendedReactTooltip/AppendedReactTooltip"
import momentDurationFormat from "moment-duration-format"
import moment from "moment"
import getMoment from "../../helpers/time"

class FormatTime extends PureComponent {
  render() {
    const { time, now, identifier, display, timeFormat, durationInterval, durationFormat, inTable } = this.props
    const _time = getMoment(time)
    const _now = getMoment(now)

    let timeDiff = undefined

    if (durationInterval && durationFormat) {
      timeDiff = moment.duration(_time.diff(_now), durationInterval).format(durationFormat, { forceLength: true })
    } else {
      timeDiff = _time.from(_now, true)
    }

    if (display === "relative") {
      if (inTable) {
        return (
          <div ref="valueDiv" data-tip={_time.format(timeFormat)}>
            {timeDiff}
          </div>
        )
      }

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

    if (inTable) {
      return (
        <div ref="valueDiv" data-tip={timeDiff}>
          {_time.format(timeFormat)}}
        </div>
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
}

FormatTime.defaultProps = {
  time: null,
  now: "now",
  display: "relative",
  timeFormat: "DD-MM-YYYY H:mm:ss",
  durationInterval: null,
  durationFormat: null,
  inTable: false
}

FormatTime.propTypes = {
  time: PropTypes.number.isRequired,
  now: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  identifier: PropTypes.string.isRequired,
  display: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  durationInterval: PropTypes.string,
  durationFormat: PropTypes.string,
  inTable: PropTypes.bool
}

export default FormatTime
