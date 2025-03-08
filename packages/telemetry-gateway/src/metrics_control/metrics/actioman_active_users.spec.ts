import { file } from "bun";
import { describe, it, expect, spyOn } from "bun:test";
import fs from "fs/promises";
import { glob } from "fs/promises";
import {
  defaultConfigUniqueCounter,
  UniqueCounter,
} from "./actioman_active_users";

describe("actioman_active_users", () => {
  it("should return default config", () => {
    defaultConfigUniqueCounter();
  });

  it("should return default config with custom maxLengthPerBucket", () => {
    defaultConfigUniqueCounter({ maxLengthPerBucket: 1_000_000 });
  });
  it("should return default config with custom volumePath", () => {
    defaultConfigUniqueCounter({ volumePath: new URL("file://foo/bis") });
  });

  it("should return buckets", async () => {
    const uniqueCounter = new UniqueCounter(
      defaultConfigUniqueCounter({
        getNowOnEpochSeconds() {
          return 1741292478;
        },
      }),
    );

    expect(uniqueCounter.buckets).toMatchSnapshot();
  });

  it("should add users", async () => {
    const uniqueCounter = new UniqueCounter();

    uniqueCounter.add("user1");
    uniqueCounter.add("user2");
  });

  it("should not add users when maxLengthPerBucket is reached", async () => {
    const uniqueCounter = new UniqueCounter(
      defaultConfigUniqueCounter({ maxLengthPerBucket: 1 }),
    );

    uniqueCounter.add("user1");

    expect(() => uniqueCounter.add("user2")).not.toThrow();

    expect(await uniqueCounter.size()).toEqual(1);
  });

  it("should sync to disk", async () => {
    const volumenPath = new URL("./__samples__/volumes_1/", import.meta.url);
    await fs.rm(volumenPath, { recursive: true, force: true });

    const uniqueCounter = new UniqueCounter(
      defaultConfigUniqueCounter({ volumePath: volumenPath }),
    ).start();

    uniqueCounter.add("user1");
    uniqueCounter.add("user2");

    await uniqueCounter.sync();

    const list = await Array.fromAsync(
      glob("**", { cwd: volumenPath.pathname }),
    );

    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("should sync to disk multiple instances", async () => {
    const volumenPath = new URL("./__samples__/volumes_1/", import.meta.url);
    await fs.rm(volumenPath, { recursive: true, force: true });

    const uniqueCounter1 = new UniqueCounter(
      defaultConfigUniqueCounter({ volumePath: volumenPath }),
    ).start();
    const uniqueCounter2 = new UniqueCounter(
      defaultConfigUniqueCounter({ volumePath: volumenPath }),
    ).start();

    uniqueCounter1.add("user1");
    uniqueCounter1.add("user2");
    uniqueCounter2.add("user1");
    uniqueCounter2.add("user3");

    await uniqueCounter1.sync();
    await uniqueCounter2.sync();

    const count = await uniqueCounter1.metrics();

    expect(count).toEqual(3);
  });

  it("should call sync when add", async () => {
    const volumenPath = new URL("./__samples__/volumes_2/", import.meta.url);
    await fs.rm(volumenPath, { recursive: true, force: true });

    const uniqueCounter = new UniqueCounter(
      defaultConfigUniqueCounter({ volumePath: volumenPath }),
    ).start();

    const pending = Promise.withResolvers<true>();

    spyOn(uniqueCounter, "sync").mockImplementation(
      // @ts-ignore
      (c) => {
        pending.resolve(true);
      },
    );

    uniqueCounter.add("user1");
    uniqueCounter.add("user2");

    await pending.promise;
  });
});
