import {
  flag,
  flags,
  isBooleanAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import type { CliContextDTO } from "../dto/cli-context.dto";

export const template = async (args: string[], ctx: CliContextDTO) => {
  type Options = { help: boolean };
  const rules: Rule<Options>[] = [
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
  ];
  const options = flags(args, {}, rules);

  const help = () => console.log(makeHelpMessage("actioman template", rules));

  if (options.help) return help();

  return help();
};
