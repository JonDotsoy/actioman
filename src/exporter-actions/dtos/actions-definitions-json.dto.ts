import { z } from "zod";

export const ActionsDefinitionsJson = z.record(
  z.string(),
  z.object({
    description: z.string().nullable(),
    input: z.object({}).nullable(),
    output: z.object({}).nullable(),
  }),
);

export type ActionsDefinitionsJsonDTO = z.infer<typeof ActionsDefinitionsJson>;
