import { spawnSync } from "child_process";
import type { SpawnSyncOptions, SpawnSyncReturns } from "child_process";

/**
 * Wrapper for spawnSync to execute a command synchronously.
 * @param command The command to run.
 * @param args List of string arguments.
 * @param options Options for process execution.
 * @returns The result of spawnSync.
 */
export function runSync(
  command: string,
  args: string[] = [],
  options: SpawnSyncOptions = {},
): SpawnSyncReturns<Buffer> {
  return spawnSync(command, args, { ...options, encoding: undefined });
}
