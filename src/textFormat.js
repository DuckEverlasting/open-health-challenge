import { colorSpan } from "./helpers";
import { Color } from "./enums";

export function xAxisFormatter(value) {
  const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
  return months[new Date(value).getMonth()]
}

export function tooltipFormatter(data) {
  if (!data.length) {
    return
  }
  
  const date = new Date(data[0].value[0]),
    tzOffset = date.getTimezoneOffset() * 60000,
    utcDate = new Date(date.valueOf() + tzOffset);
    

  let numOfSteps = null,
    systolic = [],
    diastolic = []

  data.forEach(datum => {
    if (datum.seriesId === "steps") {
      numOfSteps = datum.value[1]
    } else if (datum.seriesId === "systolic") {
      systolic.push(datum.value[1])
    } else if (datum.seriesId === "diastolic") {
      diastolic.push(datum.value[1])
    }
  });

  let text = `
    <span style="font-weight:bold">
      ${utcDate.toLocaleDateString(undefined, {})}
    </span>
  `;

  if (numOfSteps !== null) {
    text += `
      <br />
      Steps: ${colorSpan(numOfSteps, Color.LIGHTORANGE)}
    `;
  }

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
        ${parseBpText(i)}
        mm Hg
      `;
    }
  }

  return text
}