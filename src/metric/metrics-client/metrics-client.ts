export type Labels = Record<string, string>;

export type Bucket = { value: number; timestamp?: number };

export type MetricState = {
  name: string;
  help?: string;
  labels: Labels;
  value: Aggregator;
};

export type Metric = {
  name: string;
  help?: string;
  labels: Labels;
  value: number;
  timestamp?: number;
};

/** @deprecated */
export type Store = {
  current: number;
};

export interface SecondState {
  timeIndex: number;
  sum: number;
  count: number;
}

export class Aggregator {
  /** @deprecated */
  toValue() {
    return NaN;
  }

  *buckets(): Generator<Bucket> {}
}

export type MetricRefValue = MetricRef | { name: string; labels?: Labels };

export class MetricRef {
  private constructor(
    readonly name: string,
    readonly labels: Labels,
  ) {}

  private static week = new Map<string, MetricRef>();

  static from(value: MetricRefValue) {
    if (value instanceof MetricRef) return value;
    const { name, labels } = value;
    const labelsString = Object.keys(labels ?? {})
      .sort()
      .map((label) => `${label}=${labels?.[label] ?? ""}`)
      .join(",");
    const metricRefFound = MetricRef.week.get(`${name}{${labelsString}}`);
    if (metricRefFound) return metricRefFound;
    const metricRef = new MetricRef(name, labels ?? {});
    MetricRef.week.set(`${name}{${labelsString}}`, metricRef);
    return metricRef;
  }
}

export type MetricsClientOptions = {
  labels?: Labels;
};

export class MetricsClient {
  private db = new Map<MetricRef, MetricState>();

  constructor(private options?: MetricsClientOptions) {}

  bind<A extends Aggregator>(aggregator: { new (): A }) {
    return (
      state: Pick<Metric, "name"> &
        Partial<Pick<Metric, Exclude<keyof Metric, "value" | "name">>>,
    ): A => {
      const labels = {
        ...this.options?.labels,
        ...state.labels,
      };

      const ref = MetricRef.from({
        name: state.name,
        labels,
      });

      const metricState = this.db.get(ref);
      if (metricState) {
        if (!(metricState.value instanceof aggregator))
          throw new Error("Metric is not a counter");
        return metricState.value as any;
      }
      const newMetricState: MetricState = {
        name: state.name,
        labels,
        help: state.help,
        value: new aggregator(),
      };
      this.db.set(ref, newMetricState);
      return newMetricState.value as any;
    };
  }

  counter = this.bind(Counter);
  /** @deprecated */
  averageBySecond = this.bind(AverageBySecond);

  *metrics(): Generator<Metric> {
    for (const metricState of this.db.values()) {
      for (const bucket of metricState.value.buckets()) {
        yield {
          name: metricState.name,
          help: metricState.help,
          labels: metricState.labels ?? {},
          value: bucket.value,
          timestamp: bucket.timestamp,
        };
      }
    }
  }

  [Symbol.iterator] = () => this.metrics();
  toJSON = () => Array.from(this.metrics());
}

export class Counter extends Aggregator {
  private bucket: Pick<Bucket, "value"> = { value: 0 };

  increment(v: number = 1) {
    this.bucket.value += v;
  }

  decrement(v: number = 1) {
    this.bucket.value -= v;
  }

  reset() {
    this.bucket.value = 0;
  }

  toString() {
    return this.bucket.value;
  }

  *buckets(): Generator<Bucket> {
    yield {
      value: this.bucket.value,
    };
  }
}

/** @deprecated */
export class AverageBySecond extends Aggregator {
  constructor(private store = { current: 0 }) {
    super();
  }

  private static MILLISECONDS_IN_SECOND = 1000;
  static storeStates = new WeakMap<
    Store,
    {
      past?: SecondState;
      current: SecondState;
    }
  >();

  private createNewSecondState(): SecondState {
    return {
      timeIndex: NaN,
      sum: 0,
      count: 0,
    };
  }

  private ensureStoreState() {
    let storeState = AverageBySecond.storeStates.get(this.store);
    if (storeState) return storeState;
    storeState = { past: undefined, current: this.createNewSecondState() };
    AverageBySecond.storeStates.set(this.store, storeState);
    return storeState;
  }
  private selectCurrentSecondState() {
    let storeState = this.ensureStoreState();
    const currentIndex = this.getCurrentSecondTimestamp();
    if (storeState.current.timeIndex !== currentIndex) {
      storeState.past =
        storeState.current.timeIndex + 1 === currentIndex
          ? {
              timeIndex: storeState.current.timeIndex,
              sum: storeState.current.sum,
              count: storeState.current.count,
            }
          : undefined;
      storeState.current = {
        ...this.createNewSecondState(),
        timeIndex: currentIndex,
      };
    }
    return storeState;
  }

  getCurrentSecondTimestamp() {
    return Math.floor(Date.now() / AverageBySecond.MILLISECONDS_IN_SECOND);
  }

  add(valueToAdd: number) {
    const calculationState = this.selectCurrentSecondState();
    calculationState.current.sum += valueToAdd;
    calculationState.current.count += 1;
  }

  private calculateAverage(state: SecondState) {
    return state.count > 0 ? state.sum / state.count : null;
  }

  toValue(): number {
    const currentIndex = this.getCurrentSecondTimestamp();
    const state = this.ensureStoreState();
    const pastState =
      state.past?.timeIndex === currentIndex - 1 ? state.past : null;
    const currentState =
      state.current.timeIndex === currentIndex ? state : null;
    const pastAverage = pastState ? this.calculateAverage(pastState) : null;
    const average = currentState
      ? this.calculateAverage(currentState.current)
      : null;

    if (pastAverage !== null && average !== null)
      return (average + pastAverage) / 2;
    if (pastAverage === null && average !== null) return average;
    if (pastAverage !== null && average === null) return pastAverage;

    return NaN;
  }

  *buckets() {
    yield {
      value: this.toValue(),
    };
  }
}
