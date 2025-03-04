import { Registry, Counter, Histogram, Gauge } from "prom-client";
import { Temporal } from "temporal-polyfill";

type MetricKinds = Counter | Histogram | Gauge;

export class SerieRegister {
  static defaultSettings = {
    maxBatches: 2,
    rangeSeconds: 5,
  };

  constructor(
    readonly rangeSeconds: number = SerieRegister.defaultSettings.rangeSeconds,
    readonly maxBatches: number = SerieRegister.defaultSettings.maxBatches,
    readonly series = new Map<number, Registry>(),
  ) {}

  getKeySerieTime(instant: Temporal.Instant = Temporal.Now.instant()) {
    const remainder = Math.floor(instant.epochSeconds % this.rangeSeconds);
    const startTime = instant.epochSeconds - remainder;

    return {
      startTime: startTime,
      endTime: startTime + this.rangeSeconds,
    };
  }

  defineMetric<T extends MetricKinds>(name: string, initMetric: () => T) {}

  getMetric(metricName: string) {}
}
