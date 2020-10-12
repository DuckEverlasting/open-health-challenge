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
 * Returns the minimum and maximum value of an array. Includes option to
 * point to relevant data in an array of objects.
 * 
 * @param {array} array - data to parse
 * @param {string} [attribute] - if array contains objects, sets the attribute from which to pull data
 */
export function getMinMax(array, attribute=null) {
  let min = Infinity,
    max = -Infinity
  array.forEach(el => {
    const num = !!attribute ? el[attribute] : el;
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
      res[datum[2]] = [datum[1].toFixed(0)]; // Convert to fixed point "float" here because the regression fails otherwise.
    } else {
      res[datum[2]].push([datum[1].toFixed(0)]);
    }
  });
  return Object.entries(res).map(([day, arr]) => {
    const sum = (acc, curr) => acc + curr;
    return [day, arr.reduce(sum) / arr.length];
  });
}