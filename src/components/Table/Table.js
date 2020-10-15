export class Table {
  constructor(grid, chart) {
    this.grid = grid;
    this.chart = chart;
    this.chart.subscribe(this);
    this.initProps();
    this.sortAscending = true;
    this.data = this.refreshData();
    this.populate();
  }

  // Listening to this.chart
  onDataChange(type) {
    if (type && type !== this.type) {
      return;
    }
    this.data = this.refreshData();
    this.populate();
  }

  populate() {
    this.sort();
    const newGrid = this.grid.cloneNode(false);
    const sortArrow = document.createElement("div");
    sortArrow.className = "sort-arrow";
    sortArrow.innerHTML = this.sortAscending ? "&#x25B2;" : "&#x25BC;";

    this.columns.forEach((col) => {
      const colName = document.createElement("div");
      colName.textContent = col.name;
      if (col.key === this.sortBy) {
        colName.appendChild(sortArrow);
      }
      if (col.sortable) {
        colName.style.cursor = "pointer";
        colName.onclick = (e) => this.setSortBy(col.key);
      }
      colName.className = "header";
      newGrid.appendChild(colName);
    });

    this.data.forEach((datum) => {
      this.columns.forEach((col) => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = datum[col.key];
        newGrid.appendChild(cell);
      });
    });

    this.grid.parentNode.replaceChild(newGrid, this.grid);
    this.grid = newGrid;
  }

  setSortBy(parameter) {
    if (this.sortBy === parameter) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortBy = parameter;
      this.sortAscending = true;
    }
    this.populate();
  }

  sort() {
    if (!this.data[0]) {
      return;
    }
    const op = this.sortAscending ? 1 : -1;
    if (this.sortBy === "date") {
      this.data = this.data.sort((a, b) => op * (a.timestamp - b.timestamp));
    } else if (typeof this.data[0][this.sortBy] === "number") {
      this.data = this.data.sort((a, b) => op * (a[this.sortBy] - b[this.sortBy]));
    } else {
      throw new TypeError("Sort called with parameter that is not date or number")
    }
  }

  refreshData() {
    throw new Error("Method refreshData not implemented");
  }

  initProps() {
    throw new Error("Method initColumns not implemented");
  }

  getType() {
    throw new Error("Method getType not implemented");
  }

  destroy() {
    this.chart.unsubscribe(this);
  }
}
