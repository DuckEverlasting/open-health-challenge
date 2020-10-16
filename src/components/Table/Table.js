/**
 * Abstract class for handling data tables 
 *
 * @class Table
 */
export class Table {
  constructor(grid, chart) {
    this.grid = grid;
    this.chart = chart;
    // Subscribe to data changes
    this.chart.subscribe(this);
    // Sets class attributes specific to subclasses (Called here because the attributes are needed before super() is finished).
    this.initProps();
    this.sortAscending = true;
    // Get initial data
    this.data = this.refreshData();
    // Update DOM
    this.populate();
  }

  onDataChange(type) {
    // Listening to chart instance
    if (type && type !== this.type) {
      return;
    }
    this.data = this.refreshData();
    this.populate();
  }

  /**
   * Called whenever data or sort parameters change. Calls Table.sort and updates DOM. 
   *
   * @memberof Table
   */
  populate() {
    this.sort();
    const newGrid = this.grid.cloneNode(false);
    // Symbol to denote current sort state.
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
        if (typeof datum[col.key] === "number") {
          cell.className = "cell num";
        } else {
          cell.className = "cell";
        }
        cell.textContent = datum[col.key];
        newGrid.appendChild(cell);
      });
    });

    this.grid.parentNode.replaceChild(newGrid, this.grid);
    this.grid = newGrid;
  }

  /**
   * Called whenever a sortable header element is clicked.
   *
   * @param {string} parameter
   * @memberof Table
   */
  setSortBy(parameter) {
    if (this.sortBy === parameter) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortBy = parameter;
      this.sortAscending = true;
    }
    this.populate();
  }

  /**
   * Sorts table data according to current settings.
   * 
   * @throws {TypeError}
   * @memberof Table
   */
  sort() {
    if (!this.data[0]) {
      return;
    }
    const op = this.sortAscending ? 1 : -1;
    if (this.sortBy === "date") {
      // Unique sorting function for time-based sort
      this.data = this.data.sort((a, b) => op * (a.timestamp - b.timestamp));
    } else if (typeof this.data[0][this.sortBy] === "number") {
      this.data = this.data.sort((a, b) => op * (a[this.sortBy] - b[this.sortBy]));
    } else {
      // This should not happen.
      throw new TypeError("Sort called with parameter that is not date or number");
    }
  }

  refreshData() {
    throw new Error("Method refreshData not implemented");
  }

  initProps() {
    throw new Error("Method initColumns not implemented");
  }

  destroy() {
    this.chart.unsubscribe(this);
  }
}
