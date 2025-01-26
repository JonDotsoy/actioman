import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as os from "os";
import { $ } from "../../shell/shell.js";

type setupOptions = {
  name?: string;
  showLogs?: boolean;
};

const sha256 = async (body: string) => {
  const digest = new Uint8Array(
    await crypto.subtle.digest("sha256", new TextEncoder().encode(body)),
  );

  return Array.from(digest, (e) => e.toString(16).padStart(2, "0")).join("");
};

class CacheDir {
  private constructor(
    readonly cacheLocation: URL,
    readonly location: URL,
  ) {}

  async setup() {
    const tarFile = new URL(
      `${await sha256(this.location.toString())}.tgz`,
      this.cacheLocation,
    );
    await fs.mkdir(this.cacheLocation, { recursive: true });

    if (existsSync(tarFile)) {
      await $`
        tar -xzf $TARFILE -C $LOCATION
      `.appendEnvs({
        TARFILE: tarFile.pathname,
        LOCATION: this.location.pathname,
      });
    }

    return this;
  }

  async [Symbol.asyncDispose]() {
    const tarFile = new URL(
      `${await sha256(this.location.toString())}.tgz`,
      this.cacheLocation,
    );

    await $`
      tar -czf $TARFILE -C $LOCATION .
    `.appendEnvs({
      TARFILE: tarFile.pathname,
      LOCATION: this.location.pathname,
    });
  }

  static async setup(cacheLocation: URL, location: URL) {
    return new CacheDir(cacheLocation, location).setup();
  }
}

export class PrepareWorkspace {
  cacheDir = new URL(
    "__prepare-workspace/caches/",
    new URL(`${os.tmpdir()}/`, "file://"),
  );
  cachePackagesDir = new URL("./packages/", this.cacheDir);
  cacheWorkspacesDir = new URL("./workspaces/", this.cacheDir);
  workspacesDir = new URL("./workspaces/", this.cacheDir);
  private _workspaceDir?: URL | undefined;
  packageDir = new URL("../../../", import.meta.url);
  _hash?: string;
  cache?: CacheDir;

  private constructor() {}

  getHash() {
    if (!this._hash) throw new Error("Hash not set");
    return this._hash;
  }

  setHash(hash: string) {
    this._hash = hash;
  }

  public get workspaceDir(): URL {
    if (!this._workspaceDir) throw new Error("Workspace not set");
    return this._workspaceDir;
  }
  public set workspaceDir(value: URL) {
    this._workspaceDir = value;
  }

  $ = (arr: TemplateStringsArray, ...args: string[]) =>
    $(arr, ...args).cwd(this.workspaceDir.pathname);

  async describePackage() {
    const filter = (relativePath: string): boolean => {
      if (relativePath.startsWith(".git/")) return false;
      if (relativePath.startsWith(".tmp/")) return false;
      if (relativePath.startsWith("lib/")) return false;
      if (relativePath.startsWith("node_modules/")) return false;
      if (/spec\.\w+$/.test(relativePath)) return false;
      if (/\/_+\w+_+\//.test(relativePath)) return false;
      if (!/\.(ts|json)+$/.test(relativePath)) return false;
      return true;
    };

    const files = await fs.readdir(this.packageDir, { recursive: true });

    return files.filter((f) => filter(f)).sort();
  }

  async hashPackage() {
    const buff: number[] = [];
    for (const e of await this.describePackage()) {
      const path = new URL(e, this.packageDir);
      buff.push(...new Uint8Array(await fs.readFile(path)));
    }
    const hash = new Uint8Array(
      await crypto.subtle.digest("sha-256", new Uint8Array(buff)),
    );
    return `0x${Array.from(hash, (e) => e.toString(16).padStart(2, "0")).join("")}`;
  }

  packagePath() {
    return new URL(`${this.getHash()}.tgz`, this.cachePackagesDir);
  }

  async copyPackage(tarfile: string) {
    await fs.copyFile(tarfile, this.packagePath());
  }

  async setup(options: setupOptions = {}) {
    const showLogs = options.showLogs ?? false;
    const workspaceName = options.name ?? "default";
    this.workspaceDir = new URL(`${workspaceName}/`, this.workspacesDir);
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.mkdir(this.cacheWorkspacesDir, { recursive: true });
    await fs.mkdir(this.cachePackagesDir, { recursive: true });
    await fs.mkdir(this.workspaceDir, { recursive: true });
    await fs.rm(this.workspaceDir, { force: true });
    await using cache = await CacheDir.setup(
      this.cacheWorkspacesDir,
      this.workspaceDir,
    );

    this.cache = cache;

    this._hash = await this.hashPackage();
    const packagePath = await this.packagePath();
    if (!existsSync(packagePath)) {
      await $`npm pack`.cwd(this.packageDir.pathname).quiet(!showLogs);
      const tarfile =
        await $`realpath $(cat package.json | jq -r '"" + .name + "-" + .version + ".tgz"')`
          .cwd(this.packageDir.pathname)
          .text();
      await this.copyPackage(tarfile.trim());
    }

    await this.$`
      asdf local nodejs 23.6.1
      npm init -f
      npm add $PACKAGE_PATH
    `
      .appendEnvs({
        PACKAGE_PATH: this.packagePath().pathname,
      })
      .quiet(!showLogs);

    return this;
  }

  async run() {}

  static async setup(options: setupOptions = {}) {
    return new PrepareWorkspace().setup(options);
  }
}
