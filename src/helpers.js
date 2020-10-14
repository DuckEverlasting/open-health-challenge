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
