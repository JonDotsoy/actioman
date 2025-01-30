import {
  flag,
  flags,
  isBooleanAt,
  isStringAt,
  makeHelpMessage,
  rule,
  type Rule,
} from "@jondotsoy/flags";
import { existsSync } from "fs";
import { getActiomanLockFileLocation } from "../../actioman-lock-file-location/actioman-lock-file-location.js";
import { getCWD } from "../utils/get-cwd.js";
import { ActionmanLockFile } from "../../actioman-lock-file/actioman-lock-file.js";
import { importRemoteAction } from "../../scripts/import-remote-actions.js";
import { ActionsDocument } from "../../exporter-actions/exporter-actions.js";

async function installHandler(cwdUrl: URL) {
  const actiomanLockFileLocation = getActiomanLockFileLocation(cwdUrl);

  if (!existsSync(actiomanLockFileLocation)) {
    console.error("No actioman.lock file found.");
    return null;
  }

  const actionmanLockFile = await ActionmanLockFile.open(
    actiomanLockFileLocation,
  );

  for (const remote of actionmanLockFile.eachRemote()) {
    await importRemoteAction(
      remote.actionsName,
      cwdUrl,
      new ActionsDocument(remote.url, remote.actionsJson),
    );
  }
}

export const install = async (args: string[]) => {
  type Options = {
    cwd: string;
    help: boolean;
  };
  const rules: Rule<Options>[] = [
    rule(flag("--cwd"), isStringAt("cwd"), {
      description: "Current working directory",
    }),
    rule(flag("-h", "--help"), isBooleanAt("help"), {
      description: "Show help",
    }),
  ];
  const options = flags(args, {}, rules);

  const cwd = getCWD(options.cwd);

  const help = () => console.log(makeHelpMessage("actioman install", rules));

  if (options.help) return help();

  await installHandler(cwd);
  return;

  return help();
};
