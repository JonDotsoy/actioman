import * as bun from "bun";
import { afterEach, expect, it } from "bun:test";

const withFn = <T>(
  test: T,
  cb: (value: Exclude<T, null | undefined>) => any,
) => {
  if (test) {
    cb(test as any);
  }
};

const cleanupTasks: (() => Promise<any>)[] = [];

const workspace = async (workspaceName: string) => {
  const $ = bun.$;
  await $`mkdir -p .tmp/workspaces/`;
  await $`mkdir -p .tmp/_caches/`;
  await $`rm -rf .tmp/workspaces/${workspaceName}/`;
  // Cache recover
  await $`
    if [ -f .tmp/_caches/${workspaceName}.tar.gz ]
    then
      mkdir -p .tmp/workspaces/${workspaceName}/
      tar xf .tmp/_caches/${workspaceName}.tar.gz --directory=.tmp/workspaces/${workspaceName}/ 
    fi
  `;
  await $`mkdir -p .tmp/workspaces/${workspaceName}/_bin/`;
  await $`mkdir -p .tmp/workspaces/${workspaceName}/_work/`;

  const $bin = new $.Shell()
    .cwd(`.tmp/workspaces/${workspaceName}/_bin/`)
    .env(process.env);
  await $bin`
    echo "#!$(which bun)" > actioman
    echo "await import(\"${new URL("./actioman.ts", import.meta.url).pathname}\");" >> actioman
    chmod +x actioman
  `;
  const actioman = (await $bin`echo $PWD/actioman`.text()).trim();

  const $work = new $.Shell()
    .cwd(`.tmp/workspaces/${workspaceName}/_work/`)
    .env(process.env);

  await $work`npm pkg set config.offline=true,name=work,private=true`;
  await $work`
    if [ ! -f package.json ]
    then
      npm init -y
    fi
  `;

  await $work`npm add actioman`;

  // Cache save
  await $`tar czf .tmp/_caches/${workspaceName}.tar.gz --directory=.tmp/workspaces/${workspaceName}/ .`;

  return {
    $: $work,
    $actioman: (template: TemplateStringsArray, ...args: string[]) => ``,
    actioman: (...args: string[]) => {
      const listeningReadyPromiseResolvers = Promise.withResolvers<URL>();
      const abortController = new AbortController();
      const subprocess = bun.spawn({
        cmd: [actioman, ...args],
        cwd: `.tmp/workspaces/${workspaceName}/_work/`,
        signal: abortController.signal,
        stdout: "pipe",
        stderr: "inherit",
      });

      subprocess.stdout.pipeTo(
        new WritableStream({
          write: (data) => {
            process.stdout.write(data);
            const line = new TextDecoder().decode(data);
            withFn(/Listening on (?<url>.+)/.exec(line), (e) => {
              listeningReadyPromiseResolvers.resolve(new URL(e.groups!.url!));
            });
          },
        }),
      );

      const stop = async () => {
        abortController.abort();
        return await subprocess.exited;
      };

      cleanupTasks.push(() => stop());

      return {
        listeningReady: listeningReadyPromiseResolvers.promise,
        subprocess,
        pid: subprocess.pid,
        stop,
        exited: subprocess.exited,
      };
    },
  };
};

const sample = `
import { z } from "zod"
export const hello = {
  description: 'foo',
  input: z.object({
    name: z.string(),
  }),
  output: z.string(),
  handler: () => 'ok',
};
export const hi = () => 'hi';
`;

afterEach(async () => {
  for (const cleanupTask of cleanupTasks) {
    await cleanupTask();
  }
});

it("serves actions", async () => {
  const { $, actioman } = await workspace("foo");

  const b = new TextEncoder().encode(sample);

  await $`cat < ${b} | cat > actions.ts`;

  const { listeningReady } = actioman("serve", "actions.ts");

  const res = await fetch(new URL("__actions", await listeningReady));

  expect(res.status).toEqual(200);
  expect({ ...(await res.headers.toJSON()), date: null }).toMatchSnapshot(
    "headers response",
  );
  expect(await res.json()).toMatchSnapshot("body response");
});

it.skip("", async () => {
  const { $, actioman } = await workspace("foo");

  const b = new TextEncoder().encode(sample);

  await $`cat < ${b} | cat > actions.ts`;

  const { listeningReady } = actioman("serve", "actions.ts");

  expect(
    await actioman("add", "foo", `${await listeningReady}`).exited,
  ).toEqual(0);
});
