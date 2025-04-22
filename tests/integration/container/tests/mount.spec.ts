import { describe, it } from "bun:test";
import { setupContainer } from "../index.js";

describe("Container Mount Tests", async () => {
  it(
    "should setup the container",
    async () => {
      await setupContainer();
    },
    { timeout: 1000 * 60 * 5 },
  ); // 5 minutes
});
