import type { JsonDBRecord } from "./dtos/json-db-record";

export class ActionmanLockDocument {
  constructor(private recordsList: JsonDBRecord[] = []) {}
  keys() {
    return this.recordsList.map((e) => e.key);
  }
  set(key: string[], value: any) {
    const v: null | JsonDBRecord = this.get(key);
    if (v) v.value = value;
    else this.recordsList.push({ key, value });
  }
  get(key: string[]) {
    return (
      this.recordsList.find(
        (e) => JSON.stringify(e.key) === JSON.stringify(key),
      ) ?? null
    );
  }
  has(key: string[]) {
    return this.get(key) !== null;
  }
  delete(key: string[]) {
    this.recordsList = this.recordsList.filter(
      (e) => JSON.stringify(e.key) !== JSON.stringify(key),
    );
  }
  toJSON() {
    type NestedRecord = Record<string, any>;
    const keyRefs = new Map<string, string[]>();
    const nestedRefs = new WeakMap<string[], NestedRecord>();
    const staticKey = (key: string[]): string[] => {
      const ref = JSON.stringify(key);
      if (keyRefs.has(ref)) return keyRefs.get(ref)!;
      keyRefs.set(ref, key);
      return key;
    };
    const getDeep = (key: string[]): NestedRecord => {
      const ref = staticKey(key);
      if (nestedRefs.has(ref)) return nestedRefs.get(ref)!;
      const newNestedRecord: NestedRecord = {};
      nestedRefs.set(ref, newNestedRecord);
      const parentKey = key.slice(0, -1);
      const pathKey = key.at(-1);
      if (pathKey) {
        getDeep(key.slice(0, -1))[pathKey] = newNestedRecord;
      }
      return newNestedRecord;
    };
    this.recordsList.forEach(({ key, value }) => {
      getDeep(key).toJSON = () => value;
    });
    return JSON.stringify(nestedRefs.get(staticKey([])), null, 2);
  }
  toJSONL() {
    return this.recordsList.map((e) => JSON.stringify(e)).join("\n");
  }
  toString() {
    return this.toJSONL();
  }
  static fromJSONL(payload: string) {
    const records = payload.split("\n").reduce((acc, e) => {
      try {
        return [...acc, JSON.parse(e)];
      } catch {}
      return acc;
    }, [] as JsonDBRecord[]);

    return new ActionmanLockDocument(records);
  }
  static fromJSON(payload: string) {
    const obj = JSON.parse(payload);
    const flat = function* (
      value: unknown,
      path: string[],
    ): Generator<JsonDBRecord> {
      if (typeof value === "object" && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          yield* flat(val, [...path, key]);
        }
        return;
      }
      yield {
        key: path,
        value: value,
      };
    };

    return new ActionmanLockDocument(Array.from(flat(obj, [])));
  }
}
