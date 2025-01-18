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
  const port = options.port ?? 3000;
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
    globalThis.postMessage("ok")

    return;
  }

  if (options.help) return help();
  help();
};
