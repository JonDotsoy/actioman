import { ActionsDocument } from "../exporter-actions/exporter-actions.js";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { ActionmanLockFile } from "../actioman-lock-file/actioman-lock-file.js";
import { getActiomanLockFileLocation } from "../actioman-lock-file-location/actioman-lock-file-location.js";
import { findShareActionsFileModule } from "./find-share-actions-file-module.js";
import { normalizeName } from "./normalizeName.js";
import { getActionsDocumentTargetURL } from "./getActionsDocumentTargetURL.js";

export const importRemoteAction = async (
  name: string,
  cwdUrl: URL,
  actionsDocument: ActionsDocument,
) => {
  const actionsName = normalizeName(name);

  const actiomanLockFileLocation = getActiomanLockFileLocation(cwdUrl);
  const shareActionsFileModule = await findShareActionsFileModule(cwdUrl);

  const actiomanLockFile = await ActionmanLockFile.open(
    actiomanLockFileLocation,
  );

  const actionsDocumentTargetURL = getActionsDocumentTargetURL(
    actionsName,
    shareActionsFileModule,
  );

  if (!existsSync(actionsDocumentTargetURL))
    await fs.mkdir(new URL("./", actionsDocumentTargetURL), {
      recursive: true,
    });

  await fs.writeFile(actionsDocumentTargetURL, actionsDocument.toString());
  console.log(
    `Wrote "${name}" to ${path.relative(cwdUrl.pathname, actionsDocumentTargetURL.pathname)}`,
  );

  await fs.appendFile(
    shareActionsFileModule,
    `export { default as ${actionsName} } from './remote_actions/${actionsName}.js';\n`,
  );

  return { actiomanLockFile, actionsName };
};

export const importRemoteActions = async (
  url: URL,
  name: string,
  cwd: string,
) => {
  const actionsDocument = await ActionsDocument.fromHTTPServer(new URL(url));

  const cwdUrl = new URL(cwd, "file://");

  const { actiomanLockFile, actionsName } = await importRemoteAction(
    name,
    cwdUrl,
    actionsDocument,
  );

  actiomanLockFile.addRemote({
    actionsName: name,
    actionsKey: actionsName,
    url,
    actionsJson: actionsDocument.actionsJson,
  });
  await actiomanLockFile.save();
  console.log(`imported "${name}" from ${url}`);
};
