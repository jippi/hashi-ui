import React, { Component, PropTypes } from 'react';
// eslint-disable-next-line no-unused-vars
import momentDurationFormat from 'moment-duration-format';
import moment from 'moment';
import getMoment from '../../helpers/time';

class FormatTime extends Component {

    getTimeDiff(time, now) {
        if (this.props.durationInterval && this.props.durationFormat) {
            return moment
                .duration(time.diff(now), this.props.durationInterval)
                .format(this.props.durationFormat, { forceLength: true });
        }

        return time.from(now);
    }

    render() {
        const time = getMoment(this.props.time);
        const now = getMoment(this.props.now);
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
