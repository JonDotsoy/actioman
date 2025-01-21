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
import { Actions, defineAction } from "../../actions/actions";
import { HTTPRouter } from "../../http-router/http-router";
import * as net from "net";
import * as os from "os";
import fs from "fs/promises";

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
  };
  const rules: Rule<Options>[] = [
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

  const help = () =>
    console.log(makeHelpMessage("actioman serve <action file>", rules));

  if (actionFile) {
    console.log(`Loading ${actionFile} module...`);
    const module = await import(
      new URL(actionFile, new URL(`${process.cwd()}/`, "file:")).pathname
    );

    const router = HTTPRouter.fromModule(module)?.router;

    if (!router) return console.log(`No actions found in ${actionFile}`);

    const server = Bun.serve({
      port,
      hostname: host,
      fetch: async (req) =>
        (await router.fetch(req)) ?? new Response(null, { status: 404 }),
    });

    console.log(`Listening on ${server.url}`);

    return;
  }

  if (options.help) return help();
  help();
};
