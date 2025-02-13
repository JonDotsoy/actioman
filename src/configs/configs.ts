import { get } from "@jondotsoy/utils-js/get";
import type { Middleware } from "artur/http/router";

export type IntegrationModule = Integration;
export type ServerConfigsModule = {
  host?: string;
  port?: number;
  headers?: Record<string, string | string[]>;
  ssl?: {
    key: string;
    cert: string;
  };
};

export class Integration {
  constructor(
    readonly name: string,
    readonly hooks?: {
      "http:middleware"?: Middleware<any> | undefined;
    },
  ) {}

  static fromModule(module: unknown): Integration | null {
    const name = get.string(module, "name");
    if (!name) return null;
    const hooks = get.object(module, "hooks");

    const httpMiddleware: any = get.function(hooks, "http:middleware");

    return new Integration(name, {
      "http:middleware": httpMiddleware,
    });
  }
}

export class ServerConfigs implements ServerConfigsModule {
  host?: string;
  port?: number;
  headers?: Record<string, string | string[]>;
  ssl?: {
    key: string;
    cert: string;
  };

  private constructor() {}

  static fromModule(module: unknown): ServerConfigs {
    const serverConfigs = new ServerConfigs();

    serverConfigs.host =
      get.string(module, "host") ?? get.string(module, "hostname");
    serverConfigs.port = get.number(module, "port");
    serverConfigs.headers = Object.fromEntries(
      Array.from(
        Object.entries(get.record(module, "headers") ?? {}),
        ([key, value]) => ({
          key,
          value:
            typeof value === "string"
              ? value
              : Array.isArray(value)
                ? value.filter((value) => typeof value === "string")
                : null,
        }),
      )
        .filter(
          (
            entry,
          ): entry is Omit<typeof entry, "value"> & {
            value: Exclude<typeof entry.value, null>;
          } => entry.value !== null,
        )
        .map((entry) => [entry.key, entry.value]),
    );

    const key = get.string(module, "ssl", "key");
    const cert = get.string(module, "ssl", "cert");

    if (key && cert) {
      serverConfigs.ssl = { key, cert };
    }

    return serverConfigs;
  }
}

const stringBooleanMap: Record<string, boolean | undefined> = {
  true: true,
  "1": true,
  on: true,
  yes: true,
  false: false,
  "0": false,
  off: false,
  no: false,
};

const getStringBoolean = (obj: unknown, ...path: string[]) => {
  const value = get(obj, ...path);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return stringBooleanMap[value.toLowerCase()];
  return undefined;
};

export type ConfigsModule = {
  server?: ServerConfigsModule;
  integrations?: IntegrationModule[];
};

export class Configs {
  integrations?: Integration[] = [];
  server?: ServerConfigs;

  private constructor() {}

  get httpListenerMiddlewares() {
    return (
      this.integrations
        ?.map((integration) => integration.hooks?.["http:middleware"])
        .filter((middleware) => middleware !== undefined) ?? []
    );
  }

  get http2SecureContextOptionsKey() {
    return;
  }

  /** @deprecated */
  getHTTPListenerMiddlewares(): Middleware<any>[] {
    return this.httpListenerMiddlewares;
  }

  static fromModule(module: unknown) {
    const configs = new Configs();

    const integrations: Integration[] = [];

    for (const integrationModule of get.array(module, "integrations") ?? []) {
      const integration = Integration.fromModule(integrationModule);
      if (!integration) continue;
      integrations.push(integration);
    }

    configs.integrations = integrations;
    configs.server = ServerConfigs.fromModule(get(module, "server"));

    return configs;
  }
}
