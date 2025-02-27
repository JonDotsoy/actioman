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

export const main = async (args: string[]) => {
  type Options = {
    help: boolean;
    serve: string[];
    install: string[];
    add: string[];
  };
  const rules: Rule<Options>[] = [
    rule(command("serve"), restArgumentsAt("serve"), {
      description: "Start server",
    }),
    rule(command("add"), restArgumentsAt("add"), {
      description: "Start server",
    }),
    rule(command("install"), restArgumentsAt("install"), {
      description: "Prepare remotes for use",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
  ];
  const options = flags(args, {}, rules);

  if (options.help) return console.log(makeHelpMessage("actioman", rules));
  if (options.add) return await add(options.add);
  if (options.serve) return await serve(options.serve);
  if (options.install) return await install(options.install);

  return console.log(makeHelpMessage("actioman", rules));
};
