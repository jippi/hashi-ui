import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
// eslint-disable-next-line no-unused-vars
import momentDurationFormat from 'moment-duration-format';
import moment from 'moment';
import uuid from 'node-uuid';
import getMoment from '../../helpers/time';

class FormatTime extends Component {

    getTimeDiff(time, now) {
        if (this.props.durationInterval && this.props.durationFormat) {
            return moment
                .duration(time.diff(now), this.props.durationInterval)
                .format(this.props.durationFormat, { forceLength: true });
        }

        return time.from(now, true);
    }

    render() {
        const time = getMoment(this.props.time);
        const now = getMoment(this.props.now);
        const format = this.props.timeFormat;
        const uuidValue = uuid.v1();

        if (this.props.display === 'relative') {
            return (
              <span>
                <ReactTooltip id={ `tooltip-${uuidValue}` }>{ time.format(format) }</ReactTooltip>
                <span data-tip data-for={ `tooltip-${uuidValue}` } className="dotted">
                  {this.getTimeDiff(time, now)}
                </span>
              </span>
            );
        }

        return (
          <span>
            <ReactTooltip id={ `tooltip-${uuidValue}` }>{ this.getTimeDiff(time, now) }</ReactTooltip>
            <span data-tip data-for={ `tooltip-${uuidValue}` } className="dotted">{ time.format(format) }</span>
          </span>
        );
    }
}

FormatTime.defaultProps = {
    time: null,
    now: 'now',
    display: 'relative',
    timeFormat: 'DD-MM-YYYY H:mm:ss',
    durationInterval: null,
    durationFormat: null,
};

FormatTime.propTypes = {
    time: PropTypes.number.isRequired,
    now: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    display: PropTypes.string.isRequired,
    timeFormat: PropTypes.string.isRequired,
    durationInterval: PropTypes.string,
    durationFormat: PropTypes.string,
};

export default FormatTime;
