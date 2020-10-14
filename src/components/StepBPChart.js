import { init } from '../echarts.min';
import { regression } from 'echarts-stat';
import { Color } from "../enums";
import { tooltipFormatter } from "../format";
import { filterForReg } from "../helpers";


export class StepBPChart {
  constructor(element, data) {
    // Initialize echarts instance
    this.chart = init(element);
    this.idCount = 0;

    // Store date info
    this.dateIndex = data.dates;

    // Parse data
    this.initializeData(data);

    // Set options for echarts instance
    this.refreshConfig();
  }

  getId() {
    const id = this.idCount;
    this.idCount++;
    return id;
  }

  refreshConfig() {
    this.config = {
      grid: this.getGridOptions(),
      title: this.getTitleOptions(),
      legend: this.getLegendOptions(),
      tooltip: this.getTooltipOptions(),
      xAxis: this.getXAxisOptions(),
      yAxis: this.getYAxisOptions(),
      series: this.getSeriesOptions()
    }
    this.chart.setOption({...this.config});
  }

  initializeData(data) {
    this.stepData = data.steps_per_day.map((steps, i) => [i, steps]);
    this.bpDataDict = {}
    data.blood_pressure_data.forEach(el => {
      this.bpDataDict[this.getId()] = {
        date: el.date,
        syst: el.systolic,
        dias: el.diastolic,
      }
    });
    this.reconcileData();
  }

  async reconcileData(datasets = ["step", "bp"]) {
    if (datasets.includes("step")) {
      this.stepRegressionData = regression(
        'polynomial', this.stepData.map((el, i) => [i, el[1]]), 5
      );
    }
    if (datasets.includes("bp")) {
      this.systData = Object.keys(this.bpDataDict).map(id => [
        this.bpDataDict[id].date,
        this.bpDataDict[id].syst,
        id
      ]);
      this.systRegressionData = regression(
        'polynomial', filterForReg(this.systData), 5
      );
      this.diasData = Object.keys(this.bpDataDict).map(id => [
        this.bpDataDict[id].date,
        this.bpDataDict[id].dias,
        id
      ]);
      this.diasRegressionData = regression(
        'polynomial', filterForReg(this.diasData), 5
      );
    }
  }

  addBPData(...data) {
    data.forEach(([date, syst, dias]) => {
      this.bpDataDict[this.getId()] = {
        date,
        syst,
        dias
      }
    })
    this.reconcileData(["bp"]);
    this.refreshConfig();
  }

  deleteBPData(...ids) {
    ids.forEach(id => {
      if (this.bpDataDict[id]) {
        // Clears out the data point instead of deleting it.
        // This stops echarts from "scrambling" the points when the array shifts.
        this.bpDataDict[id] = [null, null, null]
      }
    })
    this.reconcileData(["bp"]);
    this.refreshConfig();
  }

  editStepData(...data) {
    data.forEach(([index, newSteps]) => {
      if (this.stepData[index]) {
        this.stepData[index][1] = newSteps;
      }
    })
    this.reconcileData(["step"]);
    this.refreshConfig();
  }

  exportData(datasets = ["step", "bp"]) {
    const res = {}
    if (datasets.includes("step")) {
      res.step = this.stepData.map(el => ({
        date: this.dateIndex[el[0]],
        steps: el[1]
      }));
    }
    if (datasets.includes("bp")) {
      res.bp = Object.values(this.bpDataDict)
        .sort((a, b) => a.date - b.date)
        .map(el => ({
          date: this.dateIndex[el.date],
          syst: el.syst,
          dias: el.dias
      }));
    }
    return res;
  }

  formatTooltip(...data) {
    return tooltipFormatter(this.dateIndex, ...data)
  }

  getGridOptions() {
    return {
      containLabel: true
    }
  }

  getTitleOptions() {
    return {
      textAlign: "center",
      left: "middle",
      text: 'Blood Pressure vs. Steps per Day',
    }
  }

  getLegendOptions() {
    return {
      top: 35
    }
  }

  getTooltipOptions() {
    // Note: instance uses axisPointer along x-axis to handle all display of data.
    // This ensures that all data points from selected day will be seen.
    // See tooltipFormatter for more details.
    return {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          type: 'dashed',
        },
      },
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      formatter: this.formatTooltip.bind(this),
    }
  }

  getXAxisOptions() {
    return [
      {
        // X-axis used to display month markers accurately. Not actually hooked up to any data.
        type: 'category',
        name: 'Date',
        nameLocation: "center",
        nameGap: 30,
        axisPointer: {
          show: false
        },
        nameTextStyle: {
          fontWeight: "bold",
        },
        axisTick: {
          alignWithLabel: true
        },
        data: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
      },
      {
        // X-axis used by graph data. Invisible.
        type: 'value',
        show: false,
        axisPointer: {
          label: {
            show: false,
          },
        },
        min: 0,
        max: this.stepData.length - 1,
      }
    ]
  }

  getYAxisOptions() {
    return [
      {
        // Y-axis used by step data, seen on the left side of the chart.
        name: 'Steps',
        nameLocation: "center",
        nameTextStyle: {
          fontWeight: "bold",
        },
        nameGap: 55,
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
        min: 40,
        max: 200,
        interval: 40,
        scale: true,
        axisPointer: {
          show: false,
          label: {
            show: false,
          },
        },
      },
    ]
  }

  getSeriesOptions() {
    return [
      // Scatter plots
      {
        name: 'Steps',
        id: 'steps',
        xAxisIndex: 1,
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
        data: this.stepData,
      },
      {
        name: 'Systolic Pressure',
        id: 'systolic',
        xAxisIndex: 1,
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
        data: this.systData,
      },
      {
        name: 'Diastolic Pressure',
        id: 'diastolic',
        xAxisIndex: 1,
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
        data: this.diasData,
      },
      // Regression lines
      {
        name: 'Steps',
        type: 'line',
        xAxisIndex: 1,
        id: 'steps-regression',
        symbol: 'none',
        data: this.stepRegressionData.points,
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
        data: this.systRegressionData.points,
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
        data: this.diasRegressionData.points,
        silent: true,
        lineStyle: {
          color: Color.GREEN,
          width: 3,
        }
      },
    ]
  }
}
