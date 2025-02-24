import { z } from "zod";

export const ActionDefinitionJson = z.object({
  description: z.string().nullable().optional(),
  sse: z.boolean().optional(),
  input: z.object({}).nullable().optional(),
  output: z.object({}).nullable().optional(),
});

export const ActionsDefinitionsJson = z.record(
  z.string(),
  ActionDefinitionJson,
);

export type ActionsDefinitionsJsonDTO = z.infer<typeof ActionsDefinitionsJson>;
export type ActionDefinitionJsonDTO = z.infer<typeof ActionDefinitionJson>;
