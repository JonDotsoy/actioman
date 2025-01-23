import * as fs from "fs/promises";
import { existsSync } from "fs";
import { ActionmanLockDocument } from "../actioman-lock-document/actioman-lock-document.js";

export class ActionmanLockFile {
  private constructor(
    readonly location: URL,
    readonly document: ActionmanLockDocument,
  ) {}

  async addRemote(actionsName: string, url: URL, actionsJson: string) {
    this.document.set(
      [`remotes`, `${actionsName}`, `createdAt`],
      `${new Date().toUTCString()}`,
    );
    this.document.set([`remotes`, `${actionsName}`, `url`], `${url}`);
    this.document.set(
      [`remotes`, `${actionsName}`, `actionsJson`],
      JSON.stringify(actionsJson),
    );
    this.document.set(
      [`remotes`, `${actionsName}`, `hash`],
      `0x${Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(JSON.stringify(actionsJson)),
          ),
        ),
        (e) => e.toString(16).padStart(2, "0"),
      ).join("")}`,
    );
  }

  async save() {
    await fs.writeFile(this.location, this.document.toJSON());
  }

  static async open(location: URL) {
    if (!existsSync(location))
      return new ActionmanLockFile(location, new ActionmanLockDocument([]));
    const payload = await fs.readFile(location, "utf-8");
    return new ActionmanLockFile(
      location,
      ActionmanLockDocument.fromJSON(payload),
    );
  }
}
