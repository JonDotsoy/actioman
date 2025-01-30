import * as fs from "fs/promises";
import { existsSync } from "fs";
import { ActionmanLockDocument } from "../actioman-lock-document/actioman-lock-document.js";

type Remote = {
  actionsKey: string;
  actionsName: string;
  url: URL;
  actionsJson: string;
};

export class ActionmanLockFile {
  private constructor(
    readonly location: URL,
    readonly document: ActionmanLockDocument,
  ) {}

  *eachRemote(): Generator<Remote> {
    const remoteNames = new Set<string>();
    for (const key of this.document.keys()) {
      if (key.at(0) !== "remotes") continue;
      const actionsKey = key.at(1);
      if (actionsKey === undefined) continue;
      remoteNames.add(actionsKey);
    }

    for (const actionsKey of remoteNames) {
      yield {
        actionsKey: actionsKey,
        actionsName: this.document.get([`remotes`, `${actionsKey}`, `name`])!
          .value,
        url: new URL(
          this.document.get([`remotes`, `${actionsKey}`, `url`])!.value,
        ),
        actionsJson: JSON.parse(
          this.document.get([`remotes`, `${actionsKey}`, `actionsJson`])!.value,
        ),
      } as any;
    }
  }

  async addRemote(remote: Remote) {
    const { actionsKey, actionsName, url, actionsJson } = remote;

    this.document.set([`remotes`, `${actionsKey}`, `name`], actionsName);
    this.document.set(
      [`remotes`, `${actionsKey}`, `createdAt`],
      `${new Date().toUTCString()}`,
    );
    this.document.set([`remotes`, `${actionsKey}`, `url`], `${url}`);
    this.document.set(
      [`remotes`, `${actionsKey}`, `actionsJson`],
      JSON.stringify(actionsJson),
    );
    this.document.set(
      [`remotes`, `${actionsKey}`, `hash`],
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
