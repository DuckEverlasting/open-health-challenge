import data from './data.json';
import { StepBPChart, StepTable, BPTable, Display } from "./components";

const chart = new StepBPChart(document.getElementById('chart'), data),
  stepTableElement = document.getElementById('step-table-1'),
  bpTableElement = document.getElementById('bp-table-1'),
  displayContainer = document.getElementById('display');
new StepTable(stepTableElement, chart);
new BPTable(bpTableElement, chart);
new Display(displayContainer, chart);
