import { Table } from './Table';

export class StepTable extends Table {
  // override
  refreshData() {
    return this.chart.stepData.map((el) => {
      const date = new Date(el[2]),
        offset = date.getTimezoneOffset() * 60000,
        utcDate = new Date(date.valueOf() + offset);
      return {
        date: utcDate.toLocaleDateString(),
        steps: el[1],
        timestamp: el[2]
      }
    });
  }

  // override
  initProps() {
    this.type = "step";
    this.columns = [
      { key: 'date', name: 'Date', sortable: true },
      { key: 'steps', name: 'Steps', sortable: true },
    ];
    this.sortBy = "date";
  }
}
