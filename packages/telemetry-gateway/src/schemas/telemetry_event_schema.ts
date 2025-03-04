import { z } from "zod";

export const telemetryEventSchema = z.object({
  type: z.literal("command_execution"),
  actioman_version: z.string(),
  command: z.string(),
  os_version: z.string().nullable().optional(),
  plugins_active: z.string().array().optional(),
  duration_ms: z.number().int().optional(),
  error_code: z.string().nullable().optional(),
});
