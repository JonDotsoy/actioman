import {
  argument,
  flag,
  flags,
  isBooleanAt,
  isNumberAt,
  isStringAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import * as net from "net";
import { makeServerScript } from "../../scripts/make-server-script.js";
import { getCWD } from "../utils/get-cwd.js";
import { spawnSync } from "child_process";

const nextPort = async () => {
  let porposalPort = 30320;
  while (true) {
    porposalPort++;
    const port = await new Promise<number | null>((resolve) => {
      const connectiong = net.connect({
        host: "localhost",
        port: porposalPort,
      });

      connectiong.addListener("connect", () => {
        resolve(null);
        connectiong.destroy();
      });
      connectiong.addListener("error", (err) => {
        if ("code" in err && err.code === "ECONNREFUSED") resolve(porposalPort);
      });
    });
    if (typeof port === "number") return port;
  }
};

export const serve = async (args: string[]) => {
  type Options = {
    help: boolean;
    http2: boolean;
    actionFile: string;
    port: number;
    host: string;
    cwd: string;
  };
  const rules: Rule<Options>[] = [
    rule(flag("--cwd"), isStringAt("cwd"), {
      description: "Current working directory",
    }),
    rule(flag("-p", "--port"), isNumberAt("port"), {
      description: "Port to listen on",
    }),
    rule(flag("-h", "--host"), isStringAt("host"), {
      description: "Host to listen on",
    }),
    rule(flag("--http2"), isBooleanAt("http2"), {
      description: "Use HTTP2",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
    rule(argument(), isStringAt("actionFile"), {
      description: "Actions file",
      category: "argument",
      names: ["action file"],
    }),
  ];
  const options = flags(args, {}, rules);

  const actionFile = options.actionFile;
  const port = options.port ?? (await nextPort());
  const host = options.host ?? "localhost";
  const cwd = getCWD(options.cwd);
  const http2 = options.http2 ?? false;

  if (http2) {
    console.warn("HTTP2 is experimental and may have unexpected behavior.");
  }

  const help = () =>
    console.log(makeHelpMessage("actioman serve <action file>", rules));

  if (options.help) return help();

  if (!actionFile) return console.log("Missing argument <action file>");

  const { bootstrapLocation } = await makeServerScript(
    cwd.pathname,
    new URL(actionFile, cwd).pathname,
    http2,
  );

  spawnSync(process.argv0, [new URL(bootstrapLocation).pathname], {
    cwd: cwd.pathname,
    env: {
      ...process.env,
      PORT: port.toString(),
      HOST: host,
    },
    stdio: "inherit",
  });
};
