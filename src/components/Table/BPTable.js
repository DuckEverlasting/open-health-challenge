import { Table } from './Table';

/**
 * Subclass of Table. Builds blood pressure data table.
 *
 * @class BPTable
 * @extends {Table}
 */
export class BPTable extends Table {
  // override
  refreshData() {
    const mappedData = this.chart.systData.map((el, i) => {
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
    });
    return mappedData.filter((el) => el !== null);
  }

  // override
  initProps() {
    this.type = "bp";
    this.columns = [
      { key: 'date', name: 'Date', sortable: true },
      { key: 'time', name: 'Time', sortable: false },
      { key: 'syst', name: 'Systolic', sortable: true },
      { key: 'dias', name: 'Diastolic', sortable: true },
    ];
    this.sortBy = "date";
  }
}
