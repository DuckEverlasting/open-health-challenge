import { colorSpan, getUtcDateFromTimestamp } from "./helpers";
import { Color } from "./enums";

/**
 * Parses axisPointer data and returns a formatted string.
 * 
 * @param {array} data 
 */
export function tooltipFormatter(data) {
  if (!data.length) {
    return
  }
  
  // Gets date object from timestamp.
  const utcDate = getUtcDateFromTimestamp(data[0].value[2]);
  
  let numOfSteps = null,
    systolic = [],
    diastolic = [],
    time = []

  // Collects and sorts data along axis. Ignores data from regression lines.
  data.forEach(datum => {
    if (datum.seriesId === "steps") {
      numOfSteps = datum.value[1]
    } else if (datum.seriesId === "systolic") {
      systolic.push(datum.value[1])
      time.push(datum.value[2])
    } else if (datum.seriesId === "diastolic") {
      diastolic.push(datum.value[1])
    }
  });

  // Adds date formatted for locale.
  let text = `
    <span style="font-weight:bold">
      ${utcDate.toLocaleDateString()}
    </span>
  `;

  // Adds step data if any exists.
  if (numOfSteps !== null) {
    text += `
      <br />
      Steps: ${colorSpan(numOfSteps, Color.LIGHTORANGE)}
    `;
  }

  // If blood pressure data exists, formats and displays all blood pressure data.
  // Handles edge cases where one type of data may be turned off (via the legend).
  if (systolic.length || diastolic.length) {
    const l = systolic.length || diastolic.length
    text += `
      <br />
      BP Readings:
    `
    let parseBpText;
    if (!systolic.length) {
      parseBpText = i => `
        Diastolic: ${colorSpan(diastolic[i], Color.LIGHTGREEN)}
      `
    } else if (!diastolic.length) {
      parseBpText = i => `
        Systolic: ${colorSpan(systolic[i], Color.LIGHTBLUE)}
      `
    } else {
      parseBpText = i => `
        ${colorSpan(systolic[i], Color.LIGHTBLUE)}
        /
        ${colorSpan(diastolic[i], Color.LIGHTGREEN)}
      `
    }
    for (let i = 0; i < l; i++) {
      text += `
        <br />
        ${getUtcDateFromTimestamp(time[i]).toLocaleTimeString(
          [], { hour: "numeric", minute: "numeric" } 
        )}: 
        ${parseBpText(i)}
        mm Hg
      `;
    }
  }

  return text
}