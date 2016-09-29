import moment from 'moment'
import React from 'react';

const formatTimestamp = function(timestamp, format = 'DD-MM-YYYY H:mm:ss') {
	let time = moment(timestamp / 1000000, "x")
	return <div title={time.fromNow()}>{time.format(format)}</div>
}

const relativeTimestamp = function(timestamp, format = 'DD-MM-YYYY H:mm:ss') {
	let time = moment(timestamp / 1000000, "x")
	return <div title={time.format(format)}>{time.fromNow()}</div>
}

export {
	formatTimestamp,
	relativeTimestamp
};
