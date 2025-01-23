import { describe, it, expect } from "bun:test";
import { ActionmanLockDocument } from "./actioman-lock-document";

describe("ActionmanLockDocument", () => {
  it("toJSONL", () => {
    const actionmanLockDocument = new ActionmanLockDocument();

    actionmanLockDocument.set(["wrapp", "foo", "ok"], true);
    actionmanLockDocument.set(
      ["wrapp", "foo", "age"],
      "Thu, 23 Jan 2025 18:16:04 GMT",
    );
    actionmanLockDocument.set(["wrapps", "foo", "ok"], true);

    expect(actionmanLockDocument.toJSONL()).toMatchSnapshot();
  });

  it("fromJSONL", () => {
    const actionmanLockDocument = new ActionmanLockDocument();
    actionmanLockDocument.set(["wrapp", "foo", "ok"], true);
    actionmanLockDocument.set(
      ["wrapp", "foo", "age"],
      "Thu, 23 Jan 2025 18:16:04 GMT",
    );
    actionmanLockDocument.set(["wrapps", "foo", "ok"], true);
    const payload = actionmanLockDocument.toJSONL();

    expect(ActionmanLockDocument.fromJSONL(payload)).toMatchSnapshot();
  });

  it("toJSON", () => {
    const actionmanLockDocument = new ActionmanLockDocument();

    actionmanLockDocument.set(["wrapp", "foo", "ok"], true);
    actionmanLockDocument.set(
      ["wrapp", "foo", "age"],
      "Thu, 23 Jan 2025 18:16:04 GMT",
    );
    actionmanLockDocument.set(["wrapps", "foo", "ok"], true);

    expect(
      JSON.stringify(actionmanLockDocument.toJSON(), null, 2),
    ).toMatchSnapshot();
  });

  it("fromJSON", () => {
    const actionmanLockDocument = new ActionmanLockDocument();
    actionmanLockDocument.set(["wrapp", "foo", "ok"], 4);
    actionmanLockDocument.set(
      ["wrapp", "foo", "age"],
      "Thu, 23 Jan 2025 18:16:04 GMT",
    );
    actionmanLockDocument.set(["wrapps", "foo", "ok"], true);
    const payload = JSON.stringify(actionmanLockDocument.toJSON(), null, 2);

    expect(ActionmanLockDocument.fromJSON(payload)).toMatchSnapshot();
  });
});
