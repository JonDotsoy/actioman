import {
  any,
  command,
  flag,
  flags,
  isBooleanAt,
  makeHelpMessage,
  restArgumentsAt,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import { serve } from "./serve";

export const main = async (args: string[]) => {
  type Options = { help: boolean; serve: string[] };
  const rules: Rule<Options>[] = [
    rule(command("serve"), restArgumentsAt("serve"), {
      description: "Start server",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
  ];
  const options = flags(args, {}, rules);

  if (options.help) return console.log(makeHelpMessage("actioman", rules));
  if (options.serve) return await serve(options.serve);

  return console.log(makeHelpMessage("actioman", rules));
};
