import { describe, expect, it } from "bun:test";
import { httpListenActionTemplate } from "./http-listen-action.template.js";

describe("httpListenActionTemplate", () => {
  it("generates bootstrap script", () => {
    expect(
      httpListenActionTemplate({
        target: "file://app/scripts/serve.js",
        actionFileLocation: "file://mys-actions/actios-1/actions.js",
        modules: {
          httpListenerModuleLocation: new URL(
            "file://app/mode_modules/actioman/lib/esm/http-router/http-listener.js",
          ).toString(),
        },
      }),
    ).toMatchSnapshot();
  });
});
