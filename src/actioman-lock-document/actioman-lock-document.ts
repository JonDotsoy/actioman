import type { JsonDBRecord } from "./dtos/json-db-record";

export class ActionmanLockDocument {
  constructor(private body: JsonDBRecord[]) {}
  set(key: string[], value: any) {
    const v: null | JsonDBRecord = this.get(key);
    if (v) v.value = value;
    else this.body.push({ key, value });
  }
  get(key: string[]) {
    return (
      this.body.find((e) => JSON.stringify(e.key) === JSON.stringify(key)) ??
      null
    );
  }
  has(key: string[]) {
    return this.get(key) !== null;
  }
  delete(key: string[]) {
    this.body = this.body.filter(
      (e) => JSON.stringify(e.key) !== JSON.stringify(key),
    );
  }
  toJSONL() {
    return this.body.map((e) => JSON.stringify(e)).join("\n");
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
}
