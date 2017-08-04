import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import AppendedReactTooltip from "../AppendedReactTooltip/AppendedReactTooltip"
import distanceInWordsStrict from "date-fns/distance_in_words_strict"
import format from "date-fns/format"

const nanosecondLength = 19

function normalizeTime(time) {
  const length = time.toString().length

  if (length >= nanosecondLength) {
    return time / 1000000
  }

  return time
}

function getDate(time) {
  if (time === "now" || time === null) {
    return new Date()
  }

  return new Date(normalizeTime(time))
}

class FormatTime extends PureComponent {
  render() {
    const { time, now, identifier, display, timeFormat, durationInterval, durationFormat, inTable } = this.props
    const _time = getDate(time)
    const timeDiff = distanceInWordsStrict(getDate(now), _time, { includeSeconds: true })

    if (display === "relative") {
      if (inTable) {
        return (
          <div ref="valueDiv" data-tip={format(_time, timeFormat)}>
            {timeDiff}
          </div>
        )
      }

      return (
        <span>
          <AppendedReactTooltip id={`time-${identifier}`}>
            {format(_time, timeFormat)}
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
          {format(_time, timeFormat)}}
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
