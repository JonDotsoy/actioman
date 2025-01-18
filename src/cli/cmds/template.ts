import {
  flag,
  flags,
  isBooleanAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";

export const template = async (args: string[]) => {
  type Options = { help: boolean };
  const rules: Rule<Options>[] = [
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
  ];
  const options = flags(args, {}, rules);

  if (options.help) return makeHelpMessage("actioman", rules);
};
