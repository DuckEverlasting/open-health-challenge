class Table {
  constructor(
    element,
    getData,
    {}
  ) {
    this.element = element;
    this.getData = getData;
    this.data = this.getData();
  }

  refreshData() {
    this.data = this.getData();
  }
}