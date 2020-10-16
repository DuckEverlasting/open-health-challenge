import data from './data.json';
import { StepBPChart, StepTable, BPTable, Display } from "./components";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import objectSupport from 'dayjs/plugin/objectSupport';
dayjs.extend(utc);
dayjs.extend(objectSupport);

const chart = new StepBPChart(document.getElementById('chart'), data),
  stepTableElement = document.getElementById('step-table-1'),
  bpTableElement = document.getElementById('bp-table-1'),
  displayContainer = document.getElementById('display'),
  stepTable = new StepTable(stepTableElement, chart),
  bpTable = new BPTable(bpTableElement, chart),
  display = new Display(displayContainer, chart);

  chart.chart.on("")
