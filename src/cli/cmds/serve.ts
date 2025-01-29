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
import { HTTPRouter } from "../../http-router/http-router.js";
import * as net from "net";
import { makeServerScript } from "../../scripts/make-server-script.js";
import { getCWD } from "../utils/get-cwd.js";
import { $ } from "../../shell/shell.js";

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

  const help = () =>
    console.log(makeHelpMessage("actioman serve <action file>", rules));

  if (options.help) return help();

  if (!actionFile) return console.log("Missing argument <action file>");

  const { bootstrapLocation } = await makeServerScript(
    cwd.pathname,
    new URL(actionFile, cwd).pathname,
  );

  await $`
    node $BOOTSTRAP_SCRIPT
  `
    .appendEnvs({
      BOOTSTRAP_SCRIPT: new URL(bootstrapLocation).pathname,
    })
    .cwd(cwd.pathname);
};
