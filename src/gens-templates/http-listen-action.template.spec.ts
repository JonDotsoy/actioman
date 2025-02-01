import { describe, expect, it } from "bun:test";
import { httpListenActionTemplate } from "./http-listen-action.template.js";

describe("httpListenActionTemplate", () => {
  it("generates bootstrap script", () => {
    expect(
      httpListenActionTemplate({
        target: "file://app/scripts/serve.js",
        workspaceLocation: "file://app/",
        actionFileLocation: "file://mys-actions/actios-1/actions.js",
        modules: {
          httpListenerModuleLocation: new URL(
            "file://app/mode_modules/actioman/lib/esm/http-router/http-listener.js",
          ).toString(),
          configsFactoryModuleLocation: new URL(
            "file://app/mode_modules/actioman/lib/esm/configs/configs-factory.js",
          ).toString(),
          configsModuleLocation: new URL(
            "file://app/mode_modules/actioman/lib/esm/configs/configs.js",
          ).toString(),
        },
      }),
    ).toMatchSnapshot();
  });
});
