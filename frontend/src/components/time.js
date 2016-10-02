import React, { Component, PropTypes } from 'react';
import moment from 'moment';
// eslint-disable-next-line no-unused-vars
import momentDurationFormat from 'moment-duration-format';

const nanosecondLength = 19;

class Time extends Component {

    static normalizeTime(time) {
        const length = time.toString().length;

        if (length >= nanosecondLength) {
            return time / 1000000;
        }

        return time;
    }

    static getMoment(time) {
        if (time === 'now' || time === null) {
            return moment();
        }

        return moment(this.normalizeTime(time), 'x');
    }

    static getTimeDiff(time, now) {
        if (this.props.durationInterval && this.props.durationFormat) {
            return moment
                .duration(time.diff(now), this.props.durationInterval)
                .format(this.props.durationFormat, { forceLength: true });
        }

        return time.from(now);
    }

    render() {
        const time = this.getMoment(this.props.time);
        const now = this.getMoment(this.props.now);
        const format = this.props.timeFormat;

        if (this.props.display === 'relative') {
            return (
              <div className="dotted" title={ time.format(format) }>
                {this.getTimeDiff(time, now)}
              </div>
            );
        }

        return (
          <div className="dotted" title={ this.getTimeDiff(time, now) }>
            {time.format(format)}
          </div>
        );
    }
}

Time.defaultProps = {
    time: null,
    now: 'now',
    display: 'relative',
    timeFormat: 'DD-MM-YYYY H:mm:ss',
    durationInterval: null,
    durationFormat: null,
};

Time.propTypes = {
    time: PropTypes.isRequired,
    now: PropTypes.isRequired,
    display: PropTypes.isRequired,
    timeFormat: PropTypes.isRequired,
    durationInterval: PropTypes.isRequired,
    durationFormat: PropTypes.isRequired,
};

export default Time;
