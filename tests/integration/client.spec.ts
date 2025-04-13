import { describe, it, beforeEach, afterEach } from "bun:test";
import {
  bootstrapContainer,
  initializeCliActioman,
  killContainer,
  prepareScript,
} from "./container";

beforeEach(async () => {
  await killContainer();
  await bootstrapContainer();
});

afterEach(async () => {
  // await killContainer()
});

describe("actioman serve command", () => {
  it("should execute the serve command successfully", async () => {
    const { docker } = await initializeCliActioman();
    await prepareScript("test_1", "app.ts");
    await docker("serve", "app.ts").exited;
  });
});
