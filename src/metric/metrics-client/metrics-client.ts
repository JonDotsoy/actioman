export type Labels = Record<string, string>;

export type State = {
  name: string;
  labels?: Labels;
};

export type Store = {
  current: number;
};

export interface SecondState {
  timeIndex: number;
  sum: number;
  count: number;
}

export class CalculatorState {
  constructor(readonly store: Store) {}

  toValue() {
    return this.store.current;
  }
}

export class MetricsClient {
  private db = new Map<State, CalculatorState>();
  private statesRefs = new Map<string, State>();

  constructor() {}

  private toStateKey(state: State) {
    if (!state.labels) return state.name;
    const labels = state.labels;
    const meta = Object.keys(labels)
      .sort()
      .map((labelName) => `${labelName}=${labels[labelName]}`)
      .join(",");
    return `${state.name}{${meta}}`;
  }

  private toUniqueState(state: State) {
    const stateString = this.toStateKey(state);
    const ref = this.statesRefs.get(stateString);
    if (ref) return ref;
    this.statesRefs.set(stateString, state);
    return state;
  }

  counter(state: State) {
    const calculator = this.db.get(this.toUniqueState(state)) as Counter;
    if (calculator) return calculator;
    const newCalculator = new Counter({ current: 0 });
    this.db.set(state, newCalculator);
    return newCalculator;
  }

  averageBySecond(state: State) {
    const calculator = this.db.get(
      this.toUniqueState(state),
    ) as AverageBySecond;
    if (calculator) return calculator;
    const newCalculator = new AverageBySecond({ current: 0 });
    this.db.set(state, newCalculator);
    return newCalculator;
  }

  toJSON() {
    return Object.fromEntries(
      Array.from(this.db, ([state, store]) => [
        this.toStateKey(state),
        store.toValue(),
      ]),
    );
  }

  *[Symbol.iterator]() {
    for (const [state, calculator] of this.db.entries()) {
      yield {
        state,
        value: calculator.toValue(),
      };
    }
  }
}

export class Counter extends CalculatorState {
  increment(v: number = 1) {
    this.store.current += v;
  }

  decrement(v: number = 1) {
    this.store.current -= v;
  }

  reset() {
    this.store.current = 0;
  }

  toString() {
    return this.store.current;
  }
}

export class AverageBySecond extends CalculatorState {
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
}
