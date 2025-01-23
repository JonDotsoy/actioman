import * as fs from "fs/promises";
import { existsSync } from "fs";
import { ActionmanLockDocument } from "../actioman-lock-document/actioman-lock-document.js";

export class ActionmanLockFile {
  private constructor(
    readonly location: URL,
    readonly document: ActionmanLockDocument,
  ) {}

  addRemote(actionsName: string, url: URL, actionsJson: string) {
    this.document.set(
      [`remotes`, `${actionsName}`, `createdAt`],
      `${new Date().toUTCString()}`,
    );
    this.document.set([`remotes`, `${actionsName}`, `url`], `${url}`);
    this.document.set(
      [`remotes`, `${actionsName}`, `actionsJson`],
      actionsJson,
    );
  }

  async save() {
    await fs.writeFile(this.location, this.document.toJSONL());
  }

  static async open(location: URL) {
    if (!existsSync(location))
      return new ActionmanLockFile(location, new ActionmanLockDocument([]));
    const payload = await fs.readFile(location, "utf-8");
    return new ActionmanLockFile(
      location,
      ActionmanLockDocument.fromJSONL(payload),
    );
  }
}
