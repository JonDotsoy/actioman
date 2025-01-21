import {
  argument,
  flag,
  flags,
  isBooleanAt,
  isStringAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import { $ } from "bun";

export const add = async (args: string[]) => {
  type Options = {
    help: boolean;
    actionsTargetName: string;
    actionsTargetURL: string;
  };
  const rules: Rule<Options>[] = [
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
    rule(argument(), isStringAt("actionsTargetName")),
    rule(argument(), isStringAt("actionsTargetURL")),
  ];
  const options = flags(args, {}, rules);

  if (options.help)
    return makeHelpMessage("actioman add <Actions Name> <URL>", rules);

  const actionsTargetName = options.actionsTargetName;
  const actionsTargetURL = options.actionsTargetURL;

  if (!actionsTargetName) return console.log("Missing argument <Actions Name>");
  if (!actionsTargetURL) return console.log("Missing argument <URL>");

  await $` ${new TextEncoder().encode(`console.log(require.resolve("actioman"))`)}`;
};
