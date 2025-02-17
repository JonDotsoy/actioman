import { describe, expect, it } from "bun:test";
import { ActiomanConfig, ActiomanConfigDocument } from "./actioman-config";
import { DEFAULT_KEY } from "../http-router/DEFAULT_KEY";
import { DEFAULT_CERT } from "../http-router/DEFAULT_CERT";

describe.todo("ActiomanConfigDocument", () => {
  it("test 1", async () => {
    const source = `
      export default {}
    `;

    const c = await ActiomanConfigDocument.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(source),
    );

    const node = c.queryExportDefaultNode();
  });
});

describe("ActiomanConfig", () => {
  it("updates the server port", async () => {
    const code = `export default {};`;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerPort(3000);

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server host", async () => {
    const code = `export default {};`;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerHost("my-host");

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server host from a variable declaration", async () => {
    const code =
      `` +
      `export const other = {};\n` +
      `const configs = {a:3};\n` +
      `export const tho = ()=>{};\n` +
      `export default configs;\n` +
      `export const a = 3;\n` +
      ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerHost("my-host");

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server host from a default export object", async () => {
    const code = `` + `export default { server: { port: 3000 } };\n` + ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerHost("my-host");

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server ssl key from a default export object", async () => {
    const code = `` + `export default {  };\n` + ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerSSLKey(DEFAULT_KEY);

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server ssl key from a default export object with existing ssl property", async () => {
    const code = `` + `export default { server: {ssl:{}} };\n` + ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerSSLKey(DEFAULT_KEY);

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server ssl key and cert from a default export object with existing ssl property", async () => {
    const code =
      `` +
      `export default {\n` +
      `  server: {\n` +
      `    ssl: {\n` +
      `    }\n` +
      `  }\n` +
      `};\n` +
      ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerSSLKey(DEFAULT_KEY);
    configFile.setServerSSLCert(DEFAULT_CERT);

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server ssl key and cert from a type definition", async () => {
    const code =
      `` +
      `type A = { server: { ssl: any } };\n` +
      `\n` +
      `const configs: A = {\n` +
      `  server: {\n` +
      `    ssl: {\n` +
      `    }\n` +
      `  }\n` +
      `};\n` +
      `\n` +
      `export default configs;\n` +
      `\n` +
      ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerSSLKey(DEFAULT_KEY);
    configFile.setServerSSLCert(DEFAULT_CERT);

    expect(configFile.toString()).toMatchSnapshot();
  });
  it("updates the server ssl key and cert from a default export object", async () => {
    const code =
      `` +
      `\n` +
      `export default {\n` +
      `  server: {\n` +
      `    ssl: {\n` +
      `    }\n` +
      `  }\n` +
      `};\n` +
      ``;

    const configFile = await ActiomanConfig.fromSourceFile(
      new URL("file://app/script.ts"),
      new TextEncoder().encode(code),
    );

    configFile.setServerSSLKey(DEFAULT_KEY);
    configFile.setServerSSLCert(DEFAULT_CERT);

    expect(configFile.toString()).toMatchSnapshot();
  });
});
