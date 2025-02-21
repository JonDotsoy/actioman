// ↑, ↓, ↔
export enum Direction {
  up = "↑",
  down = "↓",
  left = "←",
  right = "→",
  same = "↔",
}

export type Stat = {
  requests: number;
  countErrors: number;
  dataTransference: number;
  requestDurationAverage: number;
  requestDurationDirection?: Direction;
};

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;
const GIGABYTE = MEGABYTE * 1024;
const TERABYTE = GIGABYTE * 1024;

class Formats {
  byteFormat: Intl.NumberFormat;
  kilobyteFormat: Intl.NumberFormat;
  megabyteFormat: Intl.NumberFormat;
  gigabyteFormat: Intl.NumberFormat;
  terabyteFormat: Intl.NumberFormat;
  numberFormat: Intl.NumberFormat;
  percentFormat: Intl.NumberFormat;
  millisecondFormat: Intl.NumberFormat;
  dataSizeFormat: { format: (bytes: number) => string };

  constructor(readonly locale?: string) {
    this.byteFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "byte",
    });
    this.kilobyteFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "kilobyte",
    });
    this.megabyteFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "megabyte",
    });
    this.gigabyteFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "gigabyte",
    });
    this.terabyteFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "terabyte",
    });
    this.numberFormat = new Intl.NumberFormat(this.locale);
    this.percentFormat = new Intl.NumberFormat(this.locale, {
      style: "percent",
    });
    this.millisecondFormat = new Intl.NumberFormat(this.locale, {
      style: "unit",
      unit: "millisecond",
    });
    this.dataSizeFormat = this.createDataSizeFormat();
  }

  private createDataSizeFormat() {
    const {
      byteFormat,
      kilobyteFormat,
      megabyteFormat,
      gigabyteFormat,
      terabyteFormat,
    } = this;

    const format = (bytes: number): string => {
      if (bytes >= TERABYTE) return terabyteFormat.format(bytes / TERABYTE);
      if (bytes >= GIGABYTE) return gigabyteFormat.format(bytes / GIGABYTE);
      if (bytes >= MEGABYTE) return megabyteFormat.format(bytes / MEGABYTE);
      if (bytes >= KILOBYTE) return kilobyteFormat.format(bytes / KILOBYTE);
      return byteFormat.format(bytes);
    };

    return {
      format,
    };
  }
}

export class ShellDashboard {
  private items: Map<string, Stat> = new Map();
  private itemColSize = 0;
  private footer?: string;

  private formats = new Formats();

  addItem(key: string) {
    this.items.set(key, {
      requests: 0,
      countErrors: 0,
      dataTransference: 0,
      requestDurationAverage: 0,
    });
    this.itemColSize = Math.max(this.itemColSize, key.length);
  }

  updateItem(key: string, stat: Partial<Stat>) {
    const prevStat = this.items.get(key);
    if (!prevStat) throw new Error(`Item ${key} not found`);
    const newState = {
      ...prevStat,
      ...stat,
    };
    this.items.set(key, {
      ...newState,
      requestDurationDirection:
        newState.requestDurationAverage > prevStat.requestDurationAverage
          ? Direction.up
          : newState.requestDurationAverage < prevStat.requestDurationAverage
            ? Direction.down
            : Direction.same,
    });
  }

  setFooter(footer: string) {
    this.footer = footer;
  }

  render(): any {
    let body = "";
    const { numberFormat, percentFormat, millisecondFormat, dataSizeFormat } =
      this.formats;

    for (const [key, stat] of this.items) {
      let errorsPercent = stat.countErrors / stat.requests;
      const cols = [
        key.padEnd(this.itemColSize, " "),
        `${numberFormat.format(stat.requests)} reqs`,
        `${percentFormat.format(Number.isNaN(errorsPercent) ? 0 : errorsPercent)} (${numberFormat.format(stat.countErrors)}) errors`,
        `${millisecondFormat.format(stat.requestDurationAverage)} ${stat.requestDurationDirection}`,
        `${dataSizeFormat.format(stat.dataTransference)}`,
      ];
      body += `${cols.join(" ")}\n`;
    }

    return `${body}${this.footer}\n`;
  }
}
