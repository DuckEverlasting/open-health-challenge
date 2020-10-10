import data from './data.json';
import {init} from './echarts.min';
import {regression} from 'echarts-stat'

// initialize echarts instance with prepared DOM
const scatterChart = init(document.getElementById('graph1'));
const regressionChart = init(document.getElementById('graph2'));
const stepData = data.steps_per_day.map((el, i) => [i+1, el]);
const systData = data.blood_pressure_data.map(el => [el.day_index + 1, el.systolic]);
const diasData = data.blood_pressure_data.map(el => [el.day_index + 1, el.diastolic]);

function filterForReg(data) {
    const res = {}
    data.forEach(datum => {
        if (!res[datum[0]]) {
            res[datum[0]] = [datum[1]]
        } else {
            res[datum[0]].push([datum[1]])
        }
    })
    return Object.entries(res).map(([day, arr]) => {
        const sum = (acc, curr) => acc + curr;
        return [
            parseInt(day),
            arr.reduce(sum) / arr.length
        ]
    })
}

const stepRegression = regression('polynomial', stepData, 10);
const systRegression = regression('polynomial', filterForReg(systData), 10);
const diasRegression = regression('polynomial', filterForReg(diasData), 10);

const getMonth = value => {
    value /= 30
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Math.round(value)]
}

function formatter(params) {
    return 'Day:' + " " + (params.value);
}

scatterChart.setOption({
    title: {
        text: 'Blood Pressure vs Steps per Day'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    axisPointer: {
        show: true,
        label: {
            formatter: formatter
        }
    },
    xAxis: {
        interval: 30.4,
        min: 1,
        max: 365,
        axisLabel: {formatter: getMonth},
        axisPointer: {
            label: {
                show: false
            }
        },
        splitLine: {
            show: false
        },
    },
    yAxis: [{
        name: "steps",
        splitLine: 10,
        min: "500",
        max: "10000",
        axisPointer: {
            show: false,
            label: {
                show: false
            }
        }
    },
    {
        name: "blood pressure",
        splitLine: 10,
        min: "60",
        max: "200",
        axisPointer: {
            show: false,
            label: {
                show: false
            }
        }
    }],
    series: [
        {
        name: 'steps',
        type: 'scatter',
        symbolSize: 6,
        itemStyle: {
            opacity: .3
        },
        emphasis: {
            itemStyle: {
                color: "red",
                opacity: 1
            }  
        },
        data: stepData
    },
    {
        name: 'systolic',
        yAxisIndex: 1,
        type: 'scatter',
        symbolSize: 6,
        itemStyle: {
            opacity: .3
        },
        emphasis: {
            itemStyle: {
                color: "blue",
                opacity: 1
            }  
        },
        data: systData
    },
    {
        name: 'diastolic',
        yAxisIndex: 1,
        type: 'scatter',
        symbolSize: 6,
        itemStyle: {
            opacity: .3
        },
        emphasis: {
            itemStyle: {
                color: "green",
                opacity: 1
            }  
        },
        data: diasData
    }]
});

regressionChart.setOption({
    title: {
        text: 'Blood Pressure vs Steps per Day'
    },
    xAxis: {
        interval: 30.4,
        min: 1,
        max: 365,
        axisLabel: {formatter: getMonth},
        axisPointer: {
            label: {
                show: false
            }
        }
    },
    yAxis: [{
        name: "steps",
        splitLine: 10,
        min: "500",
        max: "10000",
        axisPointer: {
            show: false,
            label: {
                show: false
            }
        }
    },
    {
        name: "blood pressure",
        splitLine: 10,
        min: "60",
        max: "200",
        axisPointer: {
            show: false,
            label: {
                show: false
            }
        }
    }],
    series: [{
        type: 'line',
        smooth: true,
        symbol: "none",
        data: stepRegression.points,
        silent: true,
        lineStyle: {
            color: "red",
            width: 3
        },
        itemStyle: {
            color: "transparent",

        }
    },
    {
        yAxisIndex: 1,
        type: 'line',
        smooth: true,
        symbol: "none",
        data: systRegression.points,
        silent: true,
        lineStyle: {
            color: "blue",
            width: 3
        },
        itemStyle: {
            color: "transparent",

        }
    },
    {
        yAxisIndex: 1,
        type: 'line',
        smooth: true,
        symbol: "none",
        data: diasRegression.points,
        silent: true,
        lineStyle: {
            color: "green",
            width: 3
        },
        encode: {
            tooltip: ""
        },
        itemStyle: {
            color: "transparent",

        }
    }]
});
