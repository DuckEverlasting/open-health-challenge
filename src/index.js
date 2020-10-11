import data from './data.json';
import { init } from './echarts.min';
import { regression } from 'echarts-stat';
import { Color } from "./enums";
import { colorSpan } from "./helpers";

// initialize echarts instance with prepared DOM
const scatterChart = init(document.getElementById('graph1'));
const stepData = data.steps_per_day.map((el, i) => [i + 1, el]);
const systData = data.blood_pressure_data.map((el) => [
  el.day_index + 1,
  el.systolic,
]);
const diasData = data.blood_pressure_data.map((el) => [
  el.day_index + 1,
  el.diastolic,
]);
const dayZero = new Date("Jan 1, 2020");

function filterForReg(data) {
  const res = {};
  data.forEach((datum) => {
    if (!res[datum[0]]) {
      res[datum[0]] = [datum[1].toFixed(1)]; // Convert to fixed point "float" here because the regression fails otherwise.
    } else {
      res[datum[0]].push([datum[1].toFixed(1)]);
    }
  });
  return Object.entries(res).map(([day, arr]) => {
    const sum = (acc, curr) => acc + curr;
    return [parseInt(day), arr.reduce(sum) / arr.length];
  });
}

const stepRegression = regression('polynomial', stepData, 5);
const systRegression = regression('polynomial', filterForReg(systData), 5);
const diasRegression = regression('polynomial', filterForReg(diasData), 5);

const getMonth = (value) => {
  value /= 30;
  return [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][Math.round(value)];
};

function tooltipFormatter(data) {
  if (!data.length) {
    return
  }
  const dayIndex = data[0].axisValue;

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

  const date = new Date(dayZero);
  date.setDate(date.getDate() + dayIndex);

  let text = `
    <span style="font-weight:bold">
      ${date.toDateString().slice(4)}
    </span>
  `;

  if (numOfSteps !== null) {
    text += `
      <br />
      Steps: ${colorSpan(numOfSteps, Color.LIGHTORANGE)}
    `;
  }

  if (systolic.length) {
    text += `
      <br />
      BP Readings:
    `
    for (let i = 0; i < systolic.length; i++) {
      text += `
        <br />
        ${colorSpan(systolic[i], Color.LIGHTBLUE)}
        /
        ${colorSpan(diastolic[i], Color.LIGHTGREEN)}
        mm Hg
      `;
    }
  }

  return text
}

scatterChart.setOption({
  title: {
    text: 'Blood Pressure vs. Steps per Day',
  },
  legend: {},
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      lineStyle: {
        type: 'dashed',
      },
    },
    backgroundColor: 'rgba(50,50,50,0.9)',
    formatter: tooltipFormatter,
  },
  xAxis: {
    interval: 30.4,
    min: 1,
    max: 365,
    axisLabel: { formatter: getMonth },
    axisPointer: {
      label: {
        show: false,
      },
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: [
    {
      name: 'Steps',
      splitLine: 10,
      min: '500',
      max: '10000',
      axisPointer: {
        show: false,
        label: {
          show: false,
        },
      },
    },
    {
      name: 'Blood Pressure',
      splitLine: 10,
      min: '60',
      max: '200',
      axisPointer: {
        show: false,
        label: {
          show: false,
        },
      },
    },
  ],
  series: [
    {
      name: 'Steps',
      id: 'steps',
      type: 'scatter',
      symbolSize: 6,
      itemStyle: {
        color: Color.ORANGE,
        opacity: 0.3,
      },
      emphasis: {
        itemStyle: {
          opacity: 0.8,
        },
      },
      data: stepData,
    },
    {
      name: 'Systolic Pressure',
      id: 'systolic',
      yAxisIndex: 1,
      type: 'scatter',
      symbolSize: 6,
      itemStyle: {
        color: Color.BLUE,
        opacity: 0.3,
      },
      emphasis: {
        itemStyle: {
          opacity: 0.8,
        },
      },
      data: systData,
    },
    {
      name: 'Diastolic Pressure',
      id: 'diastolic',
      yAxisIndex: 1,
      type: 'scatter',
      symbolSize: 6,
      itemStyle: {
        color: Color.GREEN,
        opacity: 0.3,
      },
      emphasis: {
        itemStyle: {
          opacity: 0.8,
        },
      },
      data: diasData,
    },
    {
      type: 'line',
      id: 'steps-regression',
      smooth: true,
      symbol: 'none',
      data: stepRegression.points,
      silent: true,
      lineStyle: {
        color: Color.ORANGE,
        width: 3,
      },
      itemStyle: {
        color: 'transparent',
      },
    },
    {
      yAxisIndex: 1,
      type: 'line',
      id: 'systolic-regression',
      smooth: true,
      symbol: 'none',
      data: systRegression.points,
      silent: true,
      lineStyle: {
        color: Color.BLUE,
        width: 3,
      },
      itemStyle: {
        color: 'transparent',
      },
    },
    {
      yAxisIndex: 1,
      type: 'line',
      id: 'diastolic-regression',
      smooth: true,
      symbol: 'none',
      data: diasRegression.points,
      silent: true,
      lineStyle: {
        color: Color.GREEN,
        width: 3,
      },
      encode: {
        tooltip: '',
      },
      itemStyle: {
        color: 'transparent',
      },
    },
  ],
});

