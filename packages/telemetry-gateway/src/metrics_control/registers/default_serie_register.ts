import { Registry } from "prom-client";

export const defaultRegistry = new Registry();

defaultRegistry.setDefaultLabels({
  instanceId: crypto.randomUUID(),
});
