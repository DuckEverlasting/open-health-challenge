import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from 'dayjs/plugin/objectSupport';
dayjs.extend(utc);
dayjs.extend(objectSupport);

/**
 * Prepares string to be placed in a template literal as a span element with
 * the given color.
 * 
 * @param {string} text 
 * @param {string} color 
 */
export function colorSpan(text, color) {
  return `<span style="color:${color}">${text}</span>`;
}

/**
 * Returns the minimum and maximum value of an array.
 * 
 * @param {array} array - data to parse
 */
export function getMinMax(array) {
  let min = Infinity,
    max = -Infinity
  array.forEach(num => {
    if (typeof num !== "number") {
      throw new TypeError();
    }
    if (num < min) {
      min = num;
    }
    if (num > max) {
      max = num;
    }
  })
  return [min, max];
}

/**
 * Takes in blood pressure data and prepares it for polynomial regression.
 * In addition to reformatting, it averages together any data points that 
 * occur on the same day.
 * 
 * @param {[[string, number, number]]} data - data to parse
 */
export function filterForReg(data) {
  const res = {};
  data.forEach((datum) => {
    // Ignore deleted data
    if (datum === null) {
      return;
    }
    if (!res[datum[0]]) {
      res[datum[0]] = [datum[1]];
    } else {
      res[datum[0]].push(datum[1]);
    }
  });
  return Object.entries(res).map(([day, arr]) => {
    const sum = (acc, curr) => acc + curr;
    return [parseInt(day), arr.reduce(sum) / arr.length];
  });
}

/**
 * Takes in a date string and returns the day of year it occurs on.
 *
 * @param {string} dateString Format: yyyy-mm-dd (same as used by the Date input)
 * @return {number} Integer representing the day of the year the datestring falls on  
 */
export function getDateIndex(dateString) {
  const end = getUtcDate(dateString),
    start = dayjs.utc({y: end.year(), M: 0, d: 0});
  return end.diff(start, "day");
}

/**
 * Takes in a date string and an optional time string and returns a UTC-formatted timestamp. 
 *
 * @param {string} dateString Format: yyyy-mm-dd (same as used by the Date input)
 * @param {string} [timeString="00:00"] Format: hh:mm (same as used by the Time input)
 * @return {number} Timestamp for the given date/time formatted to UTC
 */
export function getUTCTimestamp(dateString, timeString="00:00") {
  return getUtcDate(dateString, timeString).valueOf();
}

/**
 * Takes in a timestamp and returns a UTC Date object.
 * 
 * @param {number} ts Timestamp
 * @return {Date}
 */
export function getUtcDateFromTimestamp(ts) {
  const date = new Date(ts),
    offset = date.getTimezoneOffset() * 60000;
  return new Date(date.valueOf() + offset);
}

function getUtcDate(dateString, timeString="00:00") {
  const [ year, month, day ] = dateString.split("-"),
    [ hour, minute ] = timeString.split(":");
  return dayjs.utc({
    year: Number(year),
    month: Number(month) - 1,
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute)
  });
}

