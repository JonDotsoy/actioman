import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";
import { Temporal } from "temporal-polyfill";
import {
  existsSync,
  createReadStream as fsCreateReadStream,
  createWriteStream as fsCreateWriteStream,
} from "fs";
import fs from "fs/promises";
import { glob } from "fs/promises";
import * as os from "os";

class Interval {
  #started = Promise.withResolvers<void>();
  #paused = Promise.withResolvers<void>();
  #loop = this.#started.promise.then(async () => {
    while (true) {
      await this.cb();
      setTimeout(() => this.#resume(), this.intervalMs);
      await this.#pause();
    }
  });

  constructor(
    private cb: () => any,
    private intervalMs: number,
  ) {}

  #pause() {
    this.#paused = Promise.withResolvers<void>();
    return this.#paused.promise;
  }

  #resume() {
    this.#paused.resolve();
  }

  start() {
    this.#started.resolve();
    return this;
  }
}

const readFile = (fp: URL) => {
  const stream = fsCreateReadStream(fp, {});
  return new ReadableStream<Uint8Array>({
    start: (ctrl) => {
      stream.addListener("readable", () => {
        for (let chunk = stream.read(); chunk !== null; chunk = stream.read()) {
          ctrl.enqueue(new Uint8Array(chunk));
        }
      });
      stream.addListener("end", () => {
        ctrl.close();
      });
    },
    cancel: () => {
      stream.close();
    },
  });
};

const splitLines = async () => {
  const readableCtrlPending =
    Promise.withResolvers<ReadableStreamDefaultController<Uint8Array>>();
  const readable = new ReadableStream<Uint8Array>({
    start: (ctrl) => {
      readableCtrlPending.resolve(ctrl);
    },
  });
  const readableCtrl = await readableCtrlPending.promise;
  let chunk = new Uint8Array([]);
  const writable = new WritableStream<Uint8Array>({
    write: (partChunk) => {
      chunk = new Uint8Array([...chunk, ...partChunk]);
      while (true) {
        const indexLF = chunk.indexOf(10);
        if (indexLF !== -1) {
          readableCtrl.enqueue(chunk.slice(0, indexLF));
          chunk = chunk.slice(indexLF + 1);
          continue;
        }
        break;
      }
    },
    close: () => {
      readableCtrl.close();
    },
  });

  return { readable, writable };
};

export type ConfigUniqueCounter = {
  syncCadenceMs: number;
  syncBatchSize: number;
  maxLengthPerBucket: number;
  volumePath: URL;
  syncChunkSize: number;
  maxBuckets: number;
  secondsPerBucket: number;
  getNowOnEpochSeconds: () => number;
};

export type BucketList = Record<string, Set<string>>;
export type BucketCache = {
  minimalSerieKey: number;
  currentSerieKey: number;
  bucketList: BucketList;
};

export const defaultConfigUniqueCounter = (
  init?: Partial<ConfigUniqueCounter>,
): ConfigUniqueCounter => {
  return {
    maxLengthPerBucket: init?.maxLengthPerBucket ?? 100_000,
    volumePath:
      init?.volumePath ??
      new URL(`file://${os.tmpdir()}/metrics_unique_counter/`),
    syncChunkSize: init?.syncChunkSize ?? 10_000,
    maxBuckets: init?.maxBuckets ?? 5,
    secondsPerBucket: init?.secondsPerBucket ?? 5 /* seconds */,
    getNowOnEpochSeconds:
      init?.getNowOnEpochSeconds ?? (() => Temporal.Now.instant().epochSeconds),
    syncBatchSize: init?.syncBatchSize ?? 1_000,
    syncCadenceMs: init?.syncCadenceMs ?? 1_000,
  };
};

export class UniqueCounter {
  #continued = Promise.withResolvers<true>();
  #started = Promise.withResolvers<true>();
  #bucketsCache: BucketCache | null = null;
  #id = crypto.randomUUID();
  #configs: ConfigUniqueCounter;

  constructor(initConfig: Partial<ConfigUniqueCounter> = {}) {
    this.#configs = defaultConfigUniqueCounter(initConfig);

    // subprocess
    this.#started.promise.then(async () => {
      while (true) {
        await this.sync();
        this.#continued = Promise.withResolvers<true>();
        await this.#continued.promise;
        await new Promise((resolve) =>
          setTimeout(resolve, this.#configs.syncCadenceMs),
        );
      }
    });
  }

  getSerieTimeFilePath(serieTime: string) {
    return new URL(`./${serieTime}/${this.#id}`, this.#configs.volumePath);
  }

  serieKey(epochSeconds: number) {
    return (
      epochSeconds - Math.floor(epochSeconds % this.#configs.secondsPerBucket)
    );
  }

  get buckets() {
    const now = this.#configs.getNowOnEpochSeconds();
    const minimalSerieKey = this.serieKey(
      now - this.#configs.maxBuckets * this.#configs.secondsPerBucket,
    );
    const currentSerieKey = this.serieKey(now);

    const bucketsCache =
      this.#bucketsCache &&
      this.#bucketsCache.currentSerieKey === currentSerieKey &&
      this.#bucketsCache.minimalSerieKey === minimalSerieKey
        ? this.#bucketsCache
        : null;

    if (bucketsCache) {
      return bucketsCache.bucketList;
    }

    const nextBuckets: BucketCache = {
      minimalSerieKey: minimalSerieKey,
      currentSerieKey: currentSerieKey,
      bucketList: Object.fromEntries(
        Array.from(Array(this.#configs.maxBuckets + 1).fill(true), (_, i) => {
          return [
            minimalSerieKey + i * this.#configs.secondsPerBucket,
            new Set<string>(),
          ];
        }),
      ),
    };

    this.#bucketsCache = nextBuckets;

    return nextBuckets.bucketList;
  }

  start() {
    this.#started.resolve(true);
    return this;
  }

  continue() {
    this.#continued.resolve(true);
  }

  add(value: string) {
    const nowSerieKey = this.serieKey(this.#configs.getNowOnEpochSeconds());
    const set = this.buckets[nowSerieKey];
    if (!set) return;
    if (set.size >= this.#configs.maxLengthPerBucket) return;
    if (set.has(value)) return;
    set.add(value);
    this.continue();
  }

  async sync() {
    let itemsProcessed = 0;

    for (const [serieTime, bucket] of Object.entries(this.buckets)) {
      const serieTimeFilePath = this.getSerieTimeFilePath(serieTime);
      await fs.mkdir(new URL("./", serieTimeFilePath), { recursive: true });

      const stream = fsCreateWriteStream(serieTimeFilePath, {
        encoding: "utf-8",
      });

      for (const value of bucket) {
        itemsProcessed += 1;
        stream.write(new TextEncoder().encode(`${value}\n`));
        if (itemsProcessed % this.#configs.syncBatchSize === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }

      await new Promise<void>((resolve) => stream.end(() => resolve()));
    }
  }

  async *getMemoryList() {
    let momentSet = new Set<string>();
    for (const set of Object.values(this.buckets)) {
      for (const value of set) {
        if (momentSet.has(value)) continue;
        momentSet.add(value);
        yield value;
      }
    }
  }

  async size() {
    let l = 0;
    for await (const _ of this.getMemoryList()) {
      l += 1;
    }
    return l;
  }

  async metrics() {
    const buckets = this.buckets;
    const values = new Set<string>();
    for (const serieTime of Object.keys(buckets)) {
      const cwd = new URL("./", this.getSerieTimeFilePath(serieTime));
      if (existsSync(cwd))
        for await (const f of glob("*", { cwd: cwd.pathname })) {
          const fp = new URL(f, cwd);
          const readable = await readFile(fp)
            .pipeThrough(await splitLines())
            .getReader();
          // const readable = await readFile(fp).getReader();
          while (true) {
            const { done, value } = await readable.read();
            if (done) break;
            values.add(new TextDecoder().decode(value));
          }
        }
    }
    return values.size;
  }
}

export const actioman_active_users = new client.Gauge({
  name: "actioman_active_users",
  help: "Number of active users in Actioman.",
  labelNames: [],
  registers: [defaultRegistry],
});

const metricsState = new UniqueCounter({
  secondsPerBucket: 5,
}).start();

new Interval(async () => {
  const metrics = await metricsState.metrics();
  console.log("🚀 ~ newInterval ~ metrics:", metrics);
  actioman_active_users.set(metrics);
}, 3000).start();

export const addActiveUser = (id: string) => {
  metricsState.add(id);
};
