import { describe, expect, it } from "bun:test";
import { Configs } from "./configs";

describe("Configs", () => {
  it.todo("loads YAML configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.yaml", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it.todo("loads JSON configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.json", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it.todo("loads TOML configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.toml", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it("loads JS configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.js", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it("loads TS configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.ts", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it("loads MJS configs", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory(
        new URL("__samples__/configs.config.mjs", import.meta.url).toString(),
      ),
    ).toMatchSnapshot();
  });
  it("loads configs from the first file found", async () => {
    const { default: factory } = await import("./modules/factory.js");

    expect(
      await factory.findOn(
        new URL("__samples__/", import.meta.url).toString(),
        "configs",
      ),
    ).toMatchSnapshot();
  });
});

describe("Configs.fromModule", () => {
  it("returns a Configs instance", () => {
    const configs = Configs.fromModule({});

    expect(configs).toBeInstanceOf(Configs);
  });

  it("loads configs from a module", async () => {
    const { default: factory } = await import("./modules/factory.js");

    const configs = Configs.fromModule(
      await factory.findOn(
        new URL("__samples__/", import.meta.url).toString(),
        "configs",
      ),
    );

    expect(configs).toBeInstanceOf(Configs);
  });
});
