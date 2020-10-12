import data from './data.json';
import { init } from './echarts.min';
import { regression } from 'echarts-stat';
import { Color } from "./enums";
import { xAxisFormatter, tooltipFormatter } from "./textFormat";
import { getMinMax } from "./helpers";

// initialize echarts instance
const chart = init(document.getElementById('chart')),
  // parse data
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
  // get min/max steps (for use in determining left y-axis limits)
  [ minStep, maxStep ] = getMinMax(data.steps_per_day, "steps"),
  minStepAxis = 2000 * Math.floor(minStep / 2000),
  maxStepAxis = 2000 * Math.ceil(maxStep / 2000);

function filterForReg(data) {
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

const stepRegression = regression('polynomial', stepData.map((el, i) => [i, el[1]]), 5);
const systRegression = regression('polynomial', filterForReg(systData), 5);
const diasRegression = regression('polynomial', filterForReg(diasData), 5);

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
    type: 'time',
    name: 'Date',
    nameLocation: "center",
    nameTextStyle: {
      fontWeight: "bold",
    },
    nameGap: 30,
    boundaryGap: true,
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
    {
      name: 'Steps',
      id: 'steps',
      type: 'scatter',
      symbolSize: 5,
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
      name: 'Steps',
      type: 'line',
      xAxisIndex: 1,
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
      }
    },
    {
      name: 'Systolic Pressure',
      xAxisIndex: 1,
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
      }
    },
    {
      name: 'Diastolic Pressure',
      xAxisIndex: 1,
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
      }
    },
  ],
});

chart.on('legendselectchanged', function (params) {
  console.log(params);
});