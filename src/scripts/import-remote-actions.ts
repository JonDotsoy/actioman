import { ActionsDocument } from "../exporter-actions/exporter-actions.js";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { ActionmanLockFile } from "../actioman-lock-file/actioman-lock-file.js";
import { getActiomanLockFileLocation } from "../actioman-lock-file-location/actioman-lock-file-location.js";
import { findShareActionsFileModule } from "./find-share-actions-file-module.js";
import { findActionTargetFileModule } from "./findActionTargetFileModule.js";
import { normalizeName } from "./normalizeName.js";
import { getActionsDocumentTargetURL } from "./getActionsDocumentTargetURL.js";
import { shareActionsTemplate } from "../gens-templates/share-actions-document.template.js";

/**
 * Imports a remote action into the local project.  The action is fetched from a remote HTTP server,
 * saved to the local file system, and registered in the `share-actions` module.  The action's
 * metadata is also added to the actioman lock file.
 *
 * @param name
 * @param cwdUrl
 * @param actionsDocument
 */
export const importRemoteAction = async (
  name: string,
  cwdUrl: URL,
  actionsDocument: ActionsDocument,
) => {
  const actionsName = normalizeName(name);

  const actiomanLockFileLocation = getActiomanLockFileLocation(cwdUrl);
  const actiomanShareActionsFileModule =
    await findShareActionsFileModule(cwdUrl);
  const metadataActionsImportedJSONFile = new URL(
    `./.actions-imported.json`,
    actiomanShareActionsFileModule,
  );
  const actiomanActionTargetModuleLocation =
    await findActionTargetFileModule(cwdUrl);

  const metadataActionsImported: {
    imported?: Record<string, { name: string; path: string }>;
  } = existsSync(metadataActionsImportedJSONFile)
    ? JSON.parse(await fs.readFile(metadataActionsImportedJSONFile, "utf-8"))
    : {};
  const metadataActionsImportedRecords = metadataActionsImported.imported ?? {};

  const actiomanLockFile = await ActionmanLockFile.open(
    actiomanLockFileLocation,
  );

  const actionsDocumentTargetURL = getActionsDocumentTargetURL(
    actionsName,
    actiomanShareActionsFileModule,
  );

  if (!existsSync(actionsDocumentTargetURL))
    await fs.mkdir(new URL("./", actionsDocumentTargetURL), {
      recursive: true,
    });

  await fs.writeFile(
    actionsDocumentTargetURL,
    actionsDocument.toString({
      fileLocation: actionsDocumentTargetURL.pathname,
      actionTargetModuleLocation: actiomanActionTargetModuleLocation.pathname,
    }),
  );
  console.log(
    `Wrote "${name}" to ${path.relative(cwdUrl.pathname, actionsDocumentTargetURL.pathname)}`,
  );

  metadataActionsImportedRecords[name] = {
    name: actionsName,
    path: actionsDocumentTargetURL.toString(),
  };

  await fs.writeFile(
    actiomanShareActionsFileModule,
    shareActionsTemplate({
      fileLocation: actiomanShareActionsFileModule.toString(),
      importActionModules: Object.values(metadataActionsImportedRecords).map(
        (e) => ({
          name: e.name,
          location: e.path,
        }),
      ),
    }),
  );

  metadataActionsImported.imported = metadataActionsImportedRecords;

  await fs.writeFile(
    metadataActionsImportedJSONFile,
    JSON.stringify(metadataActionsImported, null, 2),
    "utf-8",
  );

  return { actiomanLockFile, actionsName };
};

export const importRemoteActions = async (
  url: URL,
  name: string,
  cwd: string,
) => {
  const actionsDocument = await ActionsDocument.fromHTTPServer(
    new URL(url),
    cwd,
    undefined,
  );

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
