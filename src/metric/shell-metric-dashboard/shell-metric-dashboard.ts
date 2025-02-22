import type { MetricsClient } from "../metrics-client/metrics-client";

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
  private footer: string = "";
  private refreshRenderCallbacks = new Set<() => any>();

  private formats = new Formats();

  private createItem() {
    return {
      requests: 0,
      countErrors: 0,
      dataTransference: 0,
      requestDurationAverage: 0,
    };
  }

  ensureItem(key: string) {
    if (!this.items.has(key)) {
      this.addItem(key);
    }
  }

  addItem(key: string) {
    this.items.set(key, this.createItem());
    this.itemColSize = Math.max(this.itemColSize, key.length);
  }

  updateItem(key: string, stat: Partial<Stat>) {
    this.ensureItem(key);
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
    this.refreshRenderCallbacks.forEach((refreshRenderCallback) =>
      refreshRenderCallback(),
    );

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

  subscribeMetrics(client: MetricsClient) {
    const refreshCallback = () => {
      for (const { state, value } of client) {
        const method = state.labels?.method;
        const path = state.labels?.path;

        if (!method || !path) break;

        const route = `${method} ${path}`;

        const stat: Partial<Stat> = {};

        if (state.name === "request_counters") {
          stat.requests = value;
        }
        if (state.name === "request_duration_seconds") {
          stat.requestDurationAverage = value;
        }
        if (state.name === "request_data_transference_bytes") {
          stat.dataTransference = value;
        }
        if (state.name === "request_error_counters") {
          stat.countErrors = value;
        }

        this.updateItem(route, stat);
      }
    };
    this.refreshRenderCallbacks.add(refreshCallback);
    return () => {
      this.refreshRenderCallbacks.delete(refreshCallback);
    };
  }
}
