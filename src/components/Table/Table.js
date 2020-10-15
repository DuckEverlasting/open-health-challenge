export class Table {
  constructor(grid, chart) {
    this.grid = grid;
    this.chart = chart;
    this.chart.subscribe(this);
    this.columns = this.initColumns();
    this.data = this.refreshData();
    this.populate();
  }

  onDataChange(type) {
    if (type && type !== this.getType()) {
      return;
    }
    this.data = this.refreshData();
    this.populate();
  }

  populate() {
    const newGrid = this.grid.cloneNode(false);
    
    this.columns.forEach((col) => {
      const colName = document.createElement("div");
      colName.textContent = col.name;
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

  refreshData() {
    throw new Error("Method refreshData not implemented");
  }

  initColumns() {
    throw new Error("Method initColumns not implemented");
  }

  getType() {
    throw new Error("Method getType not implemented");
  }
}
