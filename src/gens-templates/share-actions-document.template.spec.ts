import { describe, expect, it } from "bun:test";
import { shareActionsTemplate } from "./share-actions-document.template";

describe("shareActionsTemplate", () => {
  it("", () => {
    expect(
      shareActionsTemplate({
        fileLocation: "/app/script.js",
        importActionModules: [
          { name: "foo", location: "/actions/foo.js" },
          { name: "taz", location: "/actions/taz.js" },
        ],
      }),
    ).toMatchSnapshot();
  });
});
