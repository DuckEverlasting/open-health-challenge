import { Table } from './Table';

export class BPTable extends Table {
  // override
  refreshData() {
    return this.chart.systData
      .map((el, i) => {
        // Filters out deleted data. Actual filter call occurs 
        // after map so syst and dias order remains consistent.
        if (el === null) {
          return null;
        }
        const date = new Date(el[2]),
          offset = date.getTimezoneOffset() * 60000,
          utcDate = new Date(date.valueOf() + offset);
        return {
          date: utcDate.toLocaleDateString(),
          time: utcDate.toLocaleTimeString(),
          syst: el[1],
          dias: this.chart.diasData[i][1],
          timestamp: el[2]
        };
      }).filter((el) => {
        return el !== null
      }).sort((a, b) => {
        return a.timestamp - b.timestamp
      });
  }

  // override
  initColumns() {
    return [
      { key: 'date', name: 'Date' },
      { key: 'time', name: 'Time' },
      { key: 'syst', name: 'Systolic' },
      { key: 'dias', name: 'Diastolic' },
    ];
  }

  getType() {
    return "bp";
  }
}
