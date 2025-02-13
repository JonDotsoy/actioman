import { describe, it, expect } from "bun:test";
import { listAlternativeOptionsFiles } from "./factory.js";

describe("listAlternativeOptionsFiles", () => {
  it("should return an array of URLs", () => {
    expect(
      Array.from(
        listAlternativeOptionsFiles(new URL("file://app/"), "actioman"),
        (u) => u.toString(),
      ),
    ).toMatchSnapshot();
  });
});
