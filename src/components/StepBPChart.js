import { init } from '../echarts.min';
import { regression } from 'echarts-stat';
import { Color } from "../enums";
import { tooltipFormatter } from "../format";
import { filterForReg, getDateIndex, getTimestamp } from "../helpers";

export class StepBPChart {
  constructor(element, data) {
    // Initialize echarts instance
    this.chart = init(element);
    this.idCount = 0;

    // Initialize observer array
    this.observers = [];

    // Store first day of year
    this.startDate = data.start_date;

    // Parse data
    this.initializeData(data);

    // Set options for echarts instance
    this.refreshConfig();

    // Add resize listener
    window.addEventListener("resize", () => {
      this.resize();
    });
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
    this.stepData = data.steps_per_day.map(el => [el.day, el.steps, el.timestamp]);
    this.systData = data.blood_pressure_data.map(el => [
      el.day,
      el.systolic,
      el.timestamp
    ]);
    this.diasData = data.blood_pressure_data.map(el => [
      el.day,
      el.diastolic,
      el.timestamp
    ]);
    this.calculateRegressionData();
  }

  async calculateRegressionData(datasets = ["step", "bp"]) {
    if (datasets.includes("step")) {
      this.stepRegressionData = regression(
        'polynomial', this.stepData.map((el, i) => [i, el[1]]), 5
      );
    }
    if (datasets.includes("bp")) {
      this.systRegressionData = regression(
        'polynomial', filterForReg(this.systData), 5
      );
      this.diasRegressionData = regression(
        'polynomial', filterForReg(this.diasData), 5
      );
    }
  }

  addBPData(...data) {
    data.forEach(([date, time, syst, dias]) => {
      const dateIndex = getDateIndex(date, time),
        timestamp = getTimestamp(date, time);
      this.systData.push([
        dateIndex,
        syst,
        timestamp
      ]);
      this.diasData.push([
        dateIndex,
        dias,
        timestamp
      ]);
    });
    this.calculateRegressionData(["bp"]);
    this.observers.forEach(o => o.onDataChange("bp"));
    this.refreshConfig();
  }

  deleteBPData(...indecies) {
    let changesMade = false;
    indecies.forEach(i => {
      if (this.systData[i]) {
        // Clears out the data point instead of deleting it.
        // This stops echarts from "scrambling" the points when the array shifts.
        this.systData[i] = null;
        this.diasData[i] = null;
        changesMade = true;
      }
    });
    if (changesMade) {
      this.calculateRegressionData(["bp"]);
      this.observers.forEach(o => o.onDataChange("bp"));
      this.refreshConfig();
    }
  }

  // // not implemented
  // editBPData(...data) {
  //   data.forEach(([index, newSyst, newDias]) => {
  //     if (this.systData[index]) {
  //       this.systData[index][1] = newSyst;
  //       this.diasData[index][1] = newDias;
  //       changesMade = true;
  //     }
  //   });
  //   if (changesMade) {
  //     this.calculateRegressionData(["bp"]);
  //     this.observers.forEach(o => o.onDataChange("bp"));
  //     this.refreshConfig();
  //   }
  // }

  editStepData(...data) {
    let changesMade = false;
    data.forEach(([index, newSteps]) => {
      if (this.stepData[index]) {
        this.stepData[index][1] = newSteps;
        changesMade = true;
      }
    });
    if (changesMade) {
      this.calculateRegressionData(["step"]);
      this.observers.forEach(o => o.onDataChange("step"));
      this.refreshConfig();
    }
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index >= 0) {
      this.observers.splice(index, 1);
    }
  }

  resize() {
    this.chart.setOption({ animation: false });
    this.chart.resize();
    this.chart.setOption({ animation: true });
  }

  destroy() {
    window.removeEventListener("resize", this.chart.resize);
    this.chart.dispose();
    const clone = this.element.cloneNode(false);
    this.element.parentNode.replaceChild(clone, this.element);
  }

  getGridOptions() {
    return {
      containLabel: true,
      left: 40,
      right: 40,
      bottom: 30,
      top: 55
    }
  }

  getTitleOptions() {
    return {
      textAlign: "center",
      left: "middle",
      text: 'Blood Pressure vs. Steps per Day',
      padding: [15, 0, 0, 0]
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
      formatter: tooltipFormatter,
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
        data: this.stepData,
      },
      {
        name: 'Systolic Pressure',
        id: 'systolic',
        xAxisIndex: 1,
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
        data: this.systData,
      },
      {
        name: 'Diastolic Pressure',
        id: 'diastolic',
        xAxisIndex: 1,
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
