import data from './data.json';
import { init } from './echarts.min';
import { regression } from 'echarts-stat';
import { Color } from "./enums";
import { xAxisFormatter, tooltipFormatter } from "./format";
import { getMinMax, filterForReg } from "./helpers";

// Initialize echarts instance
const chart = init(document.getElementById('chart')),

// Parse data
  stepData = data.steps_per_day.map((el, i) => [el.date, el.steps]),
  systData = data.blood_pressure_data.map((el) => [
    el.date,
    el.systolic,
    el.day_index
  ]),
  diasData = data.blood_pressure_data.map((el) => [
    el.date,
    el.diastolic,
    el.day_index
  ]),

// Calculate step limits for y-axis
  [ minStep, maxStep ] = getMinMax(data.steps_per_day, "steps"),
  minStepAxis = 2000 * Math.floor(minStep / 2000),
  maxStepAxis = 2000 * Math.ceil(maxStep / 2000);

// Get regression data
const stepRegression = regression('polynomial', stepData.map((el, i) => [i, el[1]]), 5);
const systRegression = regression('polynomial', filterForReg(systData), 5);
const diasRegression = regression('polynomial', filterForReg(diasData), 5);

// Set options for echarts instance
chart.setOption({
  grid: {
    containLabel: true
  },
  title: {
    textAlign: "center",
    left: "middle",
    text: 'Blood Pressure vs. Steps per Day',
  },
  legend: {
    top: 35
  },
  // Note: instance uses axisPointer along x-axis to handle all display of data.
  // This ensures that all data points from selected day will be seen.
  // See tooltipFormatter for more details.
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
  xAxis: [{
    // X-axis used by all scatter plot data. Time based, and formatted to display months.
    type: 'time',
    name: 'Date',
    nameLocation: "center",
    nameTextStyle: {
      fontWeight: "bold",
    },
    nameGap: 30,
    axisTick: {
      alignWithLabel: true
    },
    axisLabel: {
      formatter: xAxisFormatter,
      showMinLabel: false,
      showMaxLabel: false
    },
    axisPointer: {
      label: {
        show: false,
      },
    },
    min: stepData[0][0],
    max: stepData[stepData.length - 1][0],
    splitLine: {
      show: false,
    },
    splitNumber: 12
  },
  {
    // X-axis used by regression data (which requires numerical values). Invisible.
    type: 'value',
    show: false,
    axisPointer: {
      show: false
    },
    min: 0,
    max: stepData.length
  }],
  yAxis: [
    {
      // Y-axis used by step data, seen on the left side of the chart.
      name: 'Steps',
      nameLocation: "center",
      nameTextStyle: {
        fontWeight: "bold",
      },
      nameGap: 55,
      min: minStepAxis,
      max: maxStepAxis,
      splitLine: {
        show: false
      },
      axisPointer: {
        show: false,
        label: {
          show: false,
        },
      },
    },
    {
      // Y-axis handling bp levels, seen on the right side of the chart.
      name: 'Blood Pressure',
      nameLocation: "center",
      nameTextStyle: {
        fontWeight: "bold",
      },
      nameGap: 40,
      nameRotate: 270,
      splitLine: {
        show: false
      },
      min: 30,
      max: 210,
      scale: true,
      axisPointer: {
        show: false,
        label: {
          show: false,
        },
      },
    },
  ],
  series: [
    // Scatter plots
    {
      name: 'Steps',
      id: 'steps',
      type: 'scatter',
      symbolSize: 5,
      silent: true,
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
      symbolSize: 5,
      silent: true,
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
      symbolSize: 5,
      silent: true,
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
    // Regression lines
    {
      name: 'Steps',
      type: 'line',
      xAxisIndex: 1,
      id: 'steps-regression',
      symbol: 'none',
      data: stepRegression.points,
      silent: true,
      lineStyle: {
        color: Color.ORANGE,
        width: 3,
      }
    },
    {
      name: 'Systolic Pressure',
      xAxisIndex: 1,
      yAxisIndex: 1,
      type: 'line',
      id: 'systolic-regression',
      symbol: 'none',
      data: systRegression.points,
      silent: true,
      lineStyle: {
        color: Color.BLUE,
        width: 3,
      }
    },
    {
      name: 'Diastolic Pressure',
      xAxisIndex: 1,
      yAxisIndex: 1,
      type: 'line',
      id: 'diastolic-regression',
      symbol: 'none',
      data: diasRegression.points,
      silent: true,
      lineStyle: {
        color: Color.GREEN,
        width: 3,
      }
    },
  ],
});
