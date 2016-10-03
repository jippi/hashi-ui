import moment from 'moment';

const nanosecondLength = 19;

function normalizeTime(time) {
    const length = time.toString().length;

    if (length >= nanosecondLength) {
        return time / 1000000;
    }

    return time;
}

export default function getMoment(time) {
    if (time === 'now' || time === null) {
        return moment();
    }

    return moment(normalizeTime(time), 'x');
}
