import { getDateIndex } from '../helpers';
import withValidate from '../validate';

class BPListEntry {
  constructor(element, data, chart) {
    this.element = element;
    this.data = data;
    this.chart = chart;
    this.div = document.createElement("div");
    this.div.className = "bp-list-entry";
    const text = document.createElement("p");
    text.textContent = `${this.data.time}: ${this.data.syst}/${this.data.dias}`;
    this.div.appendChild(text);
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.onclick = this.callDelete.bind(this);
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
    this.stepInput = document.getElementById("step-input");
    this.timeInput = document.getElementById("time-input");
    this.systInput = document.getElementById("systolic-input");
    this.diasInput = document.getElementById("diastolic-input");
    
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
    return { date, steps, bpData }
  }

  setData(data) {
    this.headerElement.textContent = data.date;
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
      this.update();
    });
  }

  handleEditSteps(e) {
    e.preventDefault();
    withValidate(this.stepInput, () => {
      this.chart.editStepData([
        getDateIndex(this.getCurrentDate()),
        this.stepInput.value
      ]);
      this.update();
    });
  }

  handleAddBP(e) {
    e.preventDefault();
    withValidate([this.systInput, this.diasInput], () => {
      this.chart.addBPData([
        this.getCurrentDate(),
        this.timeInput.value, // Not validated, since there are no unacceptable entries
        Number(this.systInput.value),
        Number(this.diasInput.value)
      ]);
      this.timeInput.value = "";
      this.systInput.value = "";
      this.diasInput.value = "";
      this.update();
    });
  }
}

