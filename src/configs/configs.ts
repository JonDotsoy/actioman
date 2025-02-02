import { get } from "@jondotsoy/utils-js/get";
import type { Middleware } from "artur/http/router";

export type IntegrationModule = Integration;

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
  integrations?: IntegrationModule[];
};

export class Configs {
  integrations?: Integration[] = [];

  private constructor() {}

  getHTTPListenerMiddlewares(): Middleware<any>[] {
    return (
      this.integrations
        ?.map((integration) => integration.hooks?.["http:middleware"])
        .filter((middleware) => middleware !== undefined) ?? []
    );
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

    return configs;
  }
}
