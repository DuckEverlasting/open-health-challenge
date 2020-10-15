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
  initColumns() {
    return [
      { key: 'date', name: 'Date' },
      { key: 'steps', name: 'Steps' },
    ];
  }

  getType() {
    return "step";
  }
}
