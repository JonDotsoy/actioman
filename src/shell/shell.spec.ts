import { describe, expect, it } from "bun:test";
import { $ } from "./shell";

describe("shell", () => {
  it("should execute a command and return the exit code", async () => {
    const exitCode = await $`
            echo "Hello, World!"
        `;

    expect(exitCode).toBe(0);
  });
  it("should execute a command quietly", async () => {
    await $`
            echo "Hello, World!"
        `.quiet();
  });
  it("should throw an error if the command fails", async () => {
    expect($`exit 1`.then()).rejects.toThrowError();
  });
  it("should throw an error if the command fails using throws", async () => {
    await $`exit 1`.throws();
  });
  it("should execute a command and return the text output", async () => {
    const text = await $`echo "hello!!"`.text();
    expect(text).toBe("hello!!\n");
  });
});
