import {
  flag,
  flags,
  isBooleanAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import type { CliContextDTO } from "../dto/cli-context.dto.js";
import { ACTIOMAN_VERSION } from "../../actioman-version.js";

export const version = async (args: string[], ctx: CliContextDTO) => {
  type Options = { help: boolean; json: boolean; zero: boolean };
  const rules: Rule<Options>[] = [
    rule(flag("-j", "--json"), isBooleanAt("json"), {
      description: "Output in JSON format",
    }),
    rule(flag("-z"), isBooleanAt("zero"), {
      description: "End output with a NUL (\0) character instead of a newline.",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help information for the version command.",
    }),
  ];
  const options = flags(args, {}, rules);
  const outputJson = options.json ?? false;
  const outputZero = options.zero ?? false;

  if (outputJson) {
    const output = JSON.stringify({ version: ACTIOMAN_VERSION });
    process.stdout.write(output + (outputZero ? "\0" : "\n"));
    return;
  }

  const help = () => console.log(makeHelpMessage("actioman version", rules));

  if (options.help) return help();

  const versionOutput = `Actioman version: ${ACTIOMAN_VERSION}`;
  process.stdout.write(versionOutput + (outputZero ? "\0" : "\n"));
};
