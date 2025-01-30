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
import { importRemoteActions } from "../../scripts/import-remote-actions.js";

export const add = async (args: string[]) => {
  type Options = {
    help: boolean;
    cwd: string;
    actionsTargetName: string;
    actionsTargetURL: string;
  };
  const rules: Rule<Options>[] = [
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
    rule(flag("--cwd"), isStringAt("cwd"), {
      description: "Current working directory",
    }),
    rule(argument(), isStringAt("actionsTargetName")),
    rule(argument(), isStringAt("actionsTargetURL")),
  ];
  const options = flags(args, {}, rules);

  const cwd = new URL(
    options.cwd ?? "./",
    new URL(`${process.cwd()}/`, "file://"),
  );

  if (options.help)
    return makeHelpMessage("actioman add <Actions Name> <URL>", rules);

  const actionsTargetName = options.actionsTargetName;
  const actionsTargetURL = options.actionsTargetURL;

  if (!actionsTargetName)
    return console.log(
      "Missing argument <Actions Name>: actioman add <Actions Name> <URL>",
    );
  if (!actionsTargetURL)
    return console.log(
      "Missing argument <URL>: actioman add <Actions Name> <URL>",
    );

  await importRemoteActions(
    new URL(actionsTargetURL),
    actionsTargetName,
    cwd.pathname,
  );
};
