import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import { spawn } from "child_process";
import {
  bootstrapContainer,
  cliActioman,
  docker,
  killContainer,
  prepareScript,
} from "./container";

beforeEach(async () => {
  await killContainer();
  await bootstrapContainer();
});

afterEach(async () => {
  // await killContainer()
})

it("ok", async () => {
  await prepareScript("test_1", "app.ts");
  (await cliActioman("serve", "app.ts")).verbose();
});

it("ok", async () => {
  await prepareScript("test_2", "app.ts");
  const { stdoutText, stderrText } = await cliActioman("serve", "app.ts");

  console.log();
  console.log("====== Output ======");
  console.log();
  console.log(stdoutText);
  console.log();
  console.log("===================");
  console.log("====== Error ======");
  console.log();
  console.log(stderrText);
  console.log();
  console.log("===================");
});
