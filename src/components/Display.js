import { getDateIndex, colorSpan, getUTCTimestamp, getUtcDateFromTimestamp } from '../helpers';
import { Color } from "../enums";
import withValidate from '../validate';

class BPListEntry {
  constructor(element, data, chart) {
    this.element = element;
    this.data = data;
    this.chart = chart;
    this.div = document.createElement("div");
    this.div.className = "bp-list-entry";
    const deleteButton = document.createElement("button");
    deleteButton.onclick = this.callDelete.bind(this);
    deleteButton.textContent = "❌" 
    this.div.innerHTML = `
      <p>
        ${this.data.time}: 
        ${colorSpan(this.data.syst, Color.LIGHTBLUE)}
        /
        ${colorSpan(this.data.dias, Color.LIGHTGREEN)}
      </p>
    `;
    this.div.appendChild(deleteButton);
    this.element.appendChild(this.div);
  }

  callDelete() {
    if (window.confirm("Are you sure you want to delete this data?")) {
      this.chart.deleteBPData(this.data.index);
      this.element.removeChild(this.div);
    }
  }
}

export class Display {
  constructor(container, chart, initDate="2020-01-01") {
    this.container = container;
    this.chart = chart;
    this.currentDate = initDate;
    this.headerElement = this.container.querySelector(".header"),
    this.stepsTakenElement = this.container.querySelector(".steps-taken");
    this.bpListElement = this.container.querySelector(".bp-list");
    this.dateInput = document.getElementById("date-input");
    this.stepDateInput = document.getElementById("date-input-steps");
    this.stepInput = document.getElementById("step-input");
    this.bpDateInput = document.getElementById("date-input-bp");
    this.timeInput = document.getElementById("time-input");
    this.systInput = document.getElementById("systolic-input");
    this.diasInput = document.getElementById("diastolic-input");

    // Subscribe to data changes
    this.chart.subscribe(this);

    // Setting this within JS to keep consistent with the enum value
    this.stepsTakenElement.style.color = Color.LIGHTORANGE;
    
    const changeDateForm = document.getElementById("change-date-form"),
      changeStepsForm = document.getElementById("change-steps-form"),
      addBPForm = document.getElementById("add-bp-form");

    changeDateForm.onsubmit = this.handleChangeDate.bind(this);
    changeStepsForm.onsubmit = this.handleEditSteps.bind(this);
    addBPForm.onsubmit = this.handleAddBP.bind(this);

    this.update();
  }

  update() {
    this.setData(this.getDataFromDate(this.getCurrentDate()));
  }

  // Listening to this.chart
  onDataChange() {
    this.update();
  }

  getCurrentDate() {
    return this.currentDate;
  }

  getDataFromDate(date) {
    const dateIndex = getDateIndex(date),
      steps = this.chart.stepData[dateIndex][1],
      bpData = [];
    this.chart.systData.forEach((datum, i) => {
      if (datum && datum[0] === dateIndex) {
        bpData.push({
          index: i, // Note: this is the index of the data in systData / diasData, not the dateIndex
          date: date,
          time: new Date(datum[2]).toLocaleTimeString([], { hour: "numeric", minute: "numeric" }),
          syst: datum[1],
          dias: this.chart.diasData[i][1]
        });
      }
    });
    return { steps, bpData }
  }

  setData(data) {
    const currentDateObj = getUtcDateFromTimestamp(getUTCTimestamp(this.getCurrentDate()));
    this.headerElement.textContent = "Selected Date: " + currentDateObj.toLocaleDateString(
      [], { year: "numeric", month: "long", day: "numeric" }
    );
    this.stepsTakenElement.textContent = data.steps;
    const newList = this.bpListElement.cloneNode(false);
    this.bpListElement.parentNode.replaceChild(newList, this.bpListElement);
    data.bpData.forEach(d => {
      new BPListEntry(newList, d, this.chart);
    });
    this.bpListElement = newList;
  }

  handleChangeDate(e) {
    e.preventDefault();
    withValidate(this.dateInput, () => {
      this.currentDate = this.dateInput.value;
      this.bpDateInput.value = this.dateInput.value;
      this.stepDateInput.value = this.dateInput.value;
      this.update();
    });
  }

  handleEditSteps(e) {
    e.preventDefault();
    withValidate([this.stepDateInput, this.stepInput], () => {
      this.chart.editStepData([
        getDateIndex(this.stepDateInput.value),
        this.stepInput.value
      ]);
    });
  }

  handleAddBP(e) {
    e.preventDefault();
    withValidate([this.bpDateInput, this.systInput, this.diasInput], () => {
      this.chart.addBPData([
        this.bpDateInput.value,
        this.timeInput.value, // Not validated, since there are no unacceptable entries
        Number(this.systInput.value),
        Number(this.diasInput.value)
      ]);
      this.timeInput.value = "12:00";
      this.systInput.value = "";
      this.diasInput.value = "";
    });
  }

  destroy() {
    this.chart.unsubscribe(this);
  }
}

