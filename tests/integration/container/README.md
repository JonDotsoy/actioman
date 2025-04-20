# Main scripts for container management

These scripts are part of the core service logic for integration testing and should be executed at the beginning and end of the test cycle (not part of entrypoint.sh):

- `setupContainer`: Initializes and prepares the integration test container before running tests. Should be run before any test that requires a clean container environment.
- `cleanupContainer`: Cleans up and stops the integration test container after each test. Ensures each test runs in a clean and isolated environment.

---

# Example usage in automated tests (Bun)

```ts
import { describe, it, beforeAll, afterEach } from "bun:test";
import { setupContainer, cleanupContainer } from "./container/src/setup_container";

beforeAll(async () => {
  await setupContainer();
});

describe("integration suite", () => {
  afterEach(async () => {
    await cleanupContainer();
  });

  it("should run something in the container", async () => {
    // ...your test logic
  });
});
```

---

# Detailed documentation for entrypoint.sh

This script is an entrypoint for integration containers, written in shell (sh). It provides utilities to control background processes, especially for testing or integration environments. Each section and function is documented below:

---

## General purpose

Allows you to run and control background processes (such as sleep or arbitrary commands), as well as terminate Bun-related processes, making it easier to manage automated tests in containers.

## Initial setup

- `set -e`: Exits the script if a command fails.
- `set -u`: Exits the script if an undefined variable is used.

## Global variables

- `SLEEP_PID_FILE`: Path to the temporary file where the sleep process PID is stored.
- `COMMAND_PIDS_FILE`: Path to the temporary file where the PIDs of commands executed with `exec` are stored (can be multiple).
- `APP_SOURCE_DIR`: Path to the application directory that can be cleaned with the `clear-app-source` command.

## Functions

### check_pid_status

- Checks if a process with a given PID is running.
- Returns 0 if running, 1 if not.

### kill_all_pids_excluding_1

- Kills all numeric processes in /proc except PID 1 and the sleep process (if running).
- Useful for cleaning up processes during integration tests.

### sleep_and_wait

- Starts a background sleep process for a specified time (default 60 seconds or the value of `--sleep-time`).
- Stores the PID in `SLEEP_PID_FILE`.
- If a sleep process is already running, shows a message and does not start a new one.
- Prints the wait time in minutes and seconds.

### kill_process_by_pid_file (Deprecated)

- Reads the PID stored in `SLEEP_PID_FILE`.
- If the process exists, kills it.
- Removes the PID file.
- If the file does not exist, shows a message.
- Other process management functions are recommended.

### kill_bun_processes (Deprecated)

- Searches for processes containing 'bun' in their command line.
- Attempts to kill all such processes with `kill -9`.
- Shows messages indicating the result.
- More specific process management methods are recommended.

### exec_command

- Executes an arbitrary command in the background.
- Stores the PID in `COMMAND_PIDS_FILE` (can be multiple PIDs).
- Waits for the command to finish.
- If no command is provided, shows an error.

### kill_all_exec_commands

- Reads all PIDs stored in `COMMAND_PIDS_FILE`.
- Kills all listed processes, except PID 1 and the sleep process.
- Removes the PID file.
- If the file does not exist, shows a message.

### clear_app_source_dir

- Deletes all files and folders inside `APP_SOURCE_DIR`, but not the directory itself.
- Useful for resetting the application state during integration tests.

## Main logic

- If no argument is provided, shows an error and exits.
- Depending on the first argument (`sleep`, `kill`, `kill-bun`, `exec`, `kill-exec`, `clear-app-source`), executes the corresponding function.
- If the command is not valid, shows the available commands and exits with an error.

---

## Available commands

- `sleep [--sleep-time SECONDS]`: Starts a background sleep process.
- `kill`: Terminates the previously started sleep process.
- `kill-bun`: Terminates all Bun-related processes.
- `exec <command>`: Executes an arbitrary command in the background.
- `kill-exec`: Terminates all commands executed with `exec`.
- `clear-app-source`: Cleans the application directory specified in `APP_SOURCE_DIR`.

---

### kill-exec

- Terminates (kills) all background processes that were started with the `exec` command inside the container.
- Reads all PIDs stored in `COMMAND_PIDS_FILE` and kills them, except the sleep process and PID 1.
- Removes the PID file after finishing.
- If the PID file does not exist, shows an informational message.
- Useful for cleaning up the test environment and avoiding orphaned processes.

---

## Typical usage

- To keep a container running: `./entrypoint.sh sleep --sleep-time 300`
- To run a command and be able to kill it later: `./entrypoint.sh exec node server.js`
- To terminate the sleep: `./entrypoint.sh kill`
- To terminate the command: `./entrypoint.sh kill-exec`
- To clean up Bun processes: `./entrypoint.sh kill-bun`
- To clean the application state: `./entrypoint.sh clear-app-source`

---

## Usage examples

- Keep the container running for 5 minutes:
  ```sh
  ./entrypoint.sh sleep --sleep-time 300
  ```

- Run a Node.js server in the background and then kill it:
  ```sh
  ./entrypoint.sh exec node server.js
  # ...when you want to stop it:
  ./entrypoint.sh kill-exec
  ```

- Clean the application directory:
  ```sh
  ./entrypoint.sh clear-app-source
  ```

- Terminate all Bun-related processes (deprecated):
  ```sh
  ./entrypoint.sh kill-bun
  ```

---

This script is useful for integration testing, automation, and process control in containers.
