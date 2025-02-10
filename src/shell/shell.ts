import { spawn, spawnSync } from "child_process";

type ShellConstructorOutput = "codeStatus" | "text" | "pipe";

type ShellConstructorOptions = {
  cmd: string;
  cwd?: string;
  signal?: AbortSignal;
  env?: Record<string, string>;
  output: ShellConstructorOutput;
  silent?: boolean;
};

export class ShellConstructor<T> {
  private cmd: string;
  private cwdOptions?: string;
  private abortController: AbortController;
  private envOptions: Record<string, string> | undefined;
  private appendEnvsOptions: Record<string, string> = {};
  private shouldThrow = false;
  private status: "pending" | "running" | "fulfilled" | "rejected" = "pending";
  private _promise = Promise.withResolvers<any>();
  private output: ShellConstructorOutput;
  private silent: boolean | undefined;
  private stdoutReadableController?: ReadableStreamDefaultController<Uint8Array>;
  private stdoutReadable = new ReadableStream<Uint8Array>({
    start: (controller) => {
      this.stdoutReadableController = controller;
    },
  });
  private stdoutWritable = new WritableStream<Uint8Array>({
    write: (chunk) => {
      if (!this.silent) process.stdout.write(chunk);
      if (this.output === "text" || this.output === "pipe")
        this.stdoutReadableController?.enqueue(chunk);
    },
    close: () => {
      this.stdoutReadableController?.close();
    },
  });
  private stderrWritable = new WritableStream<Uint8Array>({
    write: (chunk) => {
      if (!this.silent) process.stderr.write(chunk);
    },
  });
  runned = Promise.withResolvers<{ pid: number | undefined }>();

  constructor(options: ShellConstructorOptions) {
    this.abortController = new AbortController();
    this.cmd = options.cmd;
    this.cwdOptions = options.cwd;
    this.envOptions = options.env;
    this.output = options.output;
    this.silent = options.silent;
    options.signal?.addEventListener("abort", (event) => {
      this.abortController.abort();
    });
  }

  cwd(newCwd: string) {
    this.cwdOptions = newCwd;
    return this;
  }

  appendEnvs(env: Record<string, string>) {
    this.appendEnvsOptions = {
      ...this.appendEnvsOptions,
      ...env,
    };
    return this;
  }

  env(newEnv: Record<string, string>) {
    this.envOptions = newEnv;
    return this;
  }

  throws(shouldThrow: boolean = true) {
    this.shouldThrow = shouldThrow;
    return this;
  }

  quiet(silent: boolean = true) {
    this.silent = silent;
    return this;
  }

  text(): ShellConstructor<string> {
    this.output = "text";
    return this.quiet() as any;
  }

  background() {
    this.output = "pipe";
    const pid = this.runned.promise.then((r) => r.pid);

    let closed = false;
    return {
      pid,
      exited: this.then(),
      stdout: this.stdoutReadable,
      stderr: this.stderrWritable,
      close: async () => {
        if (closed) return;
        this.abortController.abort();
        const p = await pid;
        try {
          spawnSync(`kill ${p}`);
        } catch {}
        closed = true;
      },
    };
  }

  async run() {
    const cmd = this.cmd;
    const cwd = this.cwdOptions;
    const env = {
      ...(this.envOptions ?? process.env),
      ...this.appendEnvsOptions,
    };
    const abortController = this.abortController;
    const throws = this.shouldThrow;
    const output = this.output;
    const stdoutWritableWriter = this.stdoutWritable.getWriter();
    const stderrWritableWriter = this.stderrWritable.getWriter();

    const subprocess = spawn("sh", ["-c", cmd], {
      signal: abortController.signal,
      stdio: ["pipe", "pipe", "pipe"],
      env: env,
      cwd: cwd,
    });

    subprocess.stdout.addListener("data", (chunk: Uint8Array) => {
      stdoutWritableWriter.write(chunk);
    });
    subprocess.stdout.addListener("close", () => {
      stdoutWritableWriter.close();
    });

    subprocess.stderr.addListener("data", (chunk: Uint8Array) => {
      stderrWritableWriter.write(chunk);
    });
    subprocess.stderr.addListener("close", () => {
      stderrWritableWriter.close();
    });

    const formatOutput = async (exitCode: number) => {
      if (output === "pipe") return exitCode;
      if (output === "codeStatus") return exitCode;
      if (output === "text") {
        const text: number[] = [];
        const reader = await this.stdoutReadable.getReader();
        let readableStreamDefaultReadResult: Bun.ReadableStreamDefaultReadResult<Uint8Array>;
        while ((readableStreamDefaultReadResult = await reader.read())) {
          if (readableStreamDefaultReadResult.done) break;
          text.push(...readableStreamDefaultReadResult.value);
        }
        return new TextDecoder().decode(new Uint8Array(text));
      }
    };

    subprocess.addListener("error", (err) => {
      this._promise.reject(err);
    });

    subprocess.addListener("close", (exitCode) => {
      if (typeof exitCode === "number") {
        if (exitCode !== 0 && !throws)
          return this._promise.reject(
            new Error(`exitCode: ${exitCode} cmd: ${cmd}`),
          );
        return this._promise.resolve(formatOutput(exitCode));
      }

      return this._promise.reject(
        new Error(`exitCode is not a number: ${exitCode}`),
      );
    });
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    if (this.status === "pending") this.run();
    return this._promise.promise.then(onfulfilled, onrejected);
  }
}

export const $ = (
  arr: TemplateStringsArray,
  ...args: string[]
): ShellConstructor<number> => {
  return new ShellConstructor({
    cmd: String.raw(arr, ...args),
    output: "codeStatus",
  });
};

$.cwd =
  (cwd: string) =>
  (arr: TemplateStringsArray, ...args: string[]) =>
    $(arr, ...args).cwd(cwd);
$.env =
  (env: Record<string, string>) =>
  (arr: TemplateStringsArray, ...args: string[]) =>
    $(arr, ...args).env(env);
