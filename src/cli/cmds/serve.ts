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
import { makeServerScript } from "../../scripts/make-server-script.js";
import { getCWD } from "../utils/get-cwd.js";
import { spawn } from "child_process";
import type { CliContextDTO } from "../dto/cli-context.dto.js";


export const serve = async (args: string[], ctx: CliContextDTO) => {
  ctx.pendingMessage.command = "serve";

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
      description: "Set the current working directory for the server process",
    }),
    rule(flag("-p", "--port"), isNumberAt("port"), {
      description: "Specify the port for the server to listen on (default: 30321)",
    }),
    rule(flag("-h", "--host"), isStringAt("host"), {
      description: "Specify the host address for the server (default: localhost)",
    }),
    rule(flag("--http2"), isBooleanAt("http2"), {
      description: "Enable HTTP2 support (experimental feature)",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Display help information for the 'serve' command",
    }),
    rule(argument(), isStringAt("actionFile"), {
      description: "Path to the actions file to be served",
      category: "argument",
      names: ["action file"],
    }),
  ];
  const options = flags(args, {}, rules);

  const actionFile = options.actionFile;
  const port = options.port ?? 30321;
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

  ctx.pendingMessage.push();

  spawn(process.argv0, [new URL(bootstrapLocation).pathname], {
    cwd: cwd.pathname,
    env: {
      ...process.env,
      PORT: port.toString(),
      HOST: host,
    },
    stdio: "inherit",
  });
};
