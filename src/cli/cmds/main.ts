import {
  command,
  flag,
  flags,
  isBooleanAt,
  makeHelpMessage,
  restArgumentsAt,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import { serve } from "./serve.js";
import { add } from "./add.js";
import { install } from "./install.js";
import { version } from "./version.js";
import type { CliContextDTO } from "../dto/cli-context.dto.js";

export const main = async (args: string[], ctx: CliContextDTO) => {
  type Options = {
    help: boolean;
    serve: string[];
    install: string[];
    add: string[];
    version: string[];
  };
  const rules: Rule<Options>[] = [
    rule(command("serve"), restArgumentsAt("serve"), {
      description: "Run the Actioman server to handle actions and APIs",
    }),
    rule(command("add"), restArgumentsAt("add"), {
      description: "Add a new action or integration to your project",
    }),
    rule(command("install"), restArgumentsAt("install"), {
      description: "Install and prepare remote dependencies for use",
    }),
    rule(command("version"), restArgumentsAt("version"), {
      description: "Display the current version of the Actioman CLI",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Display help information for available commands",
    }),
  ];
  const options = flags(args, {}, rules);

  if (options.help) return console.log(makeHelpMessage("actioman", rules));
  if (options.add) return await add(options.add, ctx);
  if (options.serve) return await serve(options.serve, ctx);
  if (options.install) return await install(options.install, ctx);
  if (options.version) return await version(options.version, ctx);

  return console.log(makeHelpMessage("actioman", rules));
};
