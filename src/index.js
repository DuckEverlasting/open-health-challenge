import data from './data.json';
import { StepBPChart } from "./components";

const chart = new StepBPChart(document.getElementById('chart'), data);

const debug1 = document.getElementById('debug1');
const debug2 = document.getElementById('debug2');
const debug3 = document.getElementById('debug3');
const debug4 = document.getElementById('debug4');

debug1.onclick = () => chart.editStepData([30, 10000])
debug2.onclick = () => chart.deleteBPData(45)
debug3.onclick = () => chart.addBPData([57, 190, 170])
debug4.onclick = () => console.log(chart.exportData())
