#!/bin/sh

# entrypoint.sh
#
# This script provides process management utilities for integration testing environments.
#
# Functions:
#   check_pid_status: Checks if a process with a given PID is running.
#   kill_all_pids_excluding_1: Kills all numeric processes in /proc except PID 1 and the sleep process.
#   sleep_and_wait: Runs a sleep process for a specified time and stores its PID.
#   kill_process_by_pid_file: (Deprecated) Kills a process using a PID file.
#   kill_bun_processes: (Deprecated) Kills all processes containing 'bun' in their command line.
#   exec_command: Executes a command in the background and stores its PID.
#   kill_all_exec_commands: Kills all commands started by exec_command.
#   clear_app_source_dir: Removes all files and directories inside the application source directory.
#   compile_actioman_package: Compiles the Actioman source directory and moves the generated package to the target location.
#   install_actioman_package: Installs the Actioman package using Bun.
#
# Usage:
#   ./entrypoint.sh <command> [options]
#
# Available commands:
#   sleep [--sleep-time <seconds>]   Start a sleep process for the given time (default: 60s)
#   kill                            Kill the sleep process by PID file
#   kill-bun                        Kill all 'bun' processes (deprecated)
#   exec <command>                  Execute a command in the background
#   kill-exec                       Kill all exec'd commands
#   clear-app-source                Remove all files in the app source directory
#   compile-actioman                Compile the Actioman package
#   install-actioman                Install the Actioman package
#
# Example:
#   ./entrypoint.sh sleep --sleep-time 120
#   ./entrypoint.sh exec ls -la
#   ./entrypoint.sh compile-actioman
#   ./entrypoint.sh install-actioman
#
# Note: This script is intended for use in containerized integration test environments.

# Set ACTIOMAN_SHARE_DIR if not already set
if [ -z "${ACTIOMAN_SHARE_DIR:-}" ]; then
  export ACTIOMAN_SHARE_DIR="/usr/share/actioman"
fi

ACTIOMAN_PACKAGE="/root/pkgs/actioman.tgz"

# Enable error handling: exit on error, unset variables, and pipe failures
set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error

# Global variable for the PID file path
SLEEP_PID_FILE="/tmp/sleep_pid.tmp"
COMMAND_PIDS_FILE="/tmp/command_pid.tmp"
APP_SOURCE_DIR="/app"

# ---------------------------------------------
# check_pid_status
# Verifica si un proceso con el PID dado está corriendo.
# Argumentos:
#   $1 - PID del proceso a verificar.
# Retorna:
#   0 si el proceso está corriendo, 1 si no lo está o si no se proporciona PID.
# ---------------------------------------------
check_pid_status() {
  if [ $# -eq 0 ]; then
    echo "Error: No PID provided."
    return 1
  fi

  PID="$1"
  if kill -0 "$PID" 2>/dev/null; then
    echo "Process $PID is running."
    return 0
  else
    echo "Process $PID is not running."
    return 1
  fi
}

# ---------------------------------------------
# kill_all_pids_excluding_1
# Mata todos los procesos numéricos en /proc excepto el PID 1 y el PID guardado en SLEEP_PID_FILE.
# Utiliza el archivo SLEEP_PID_FILE para evitar matar el proceso de sleep si está corriendo.
# ---------------------------------------------
kill_all_pids_excluding_1() {
  # Leer el PID del archivo SLEEP_PID_FILE si existe
  SLEEP_PID=""
  if [ -f "$SLEEP_PID_FILE" ]; then
    SLEEP_PID=$(cat "$SLEEP_PID_FILE" 2>/dev/null || echo "")
  fi
  for pid in $(ls /proc | grep '^[0-9]\+$' | grep -v '^1$'); do
    # Evitar el PID guardado en SLEEP_PID_FILE
    if [ -n "$SLEEP_PID" ] && [ "$pid" = "$SLEEP_PID" ]; then
      echo "Skipping sleep PID $pid"
      continue
    fi
    kill -9 "$pid" 2>/dev/null && echo "Killed PID $pid" || echo "Failed to kill PID $pid"
  done
}

# ---------------------------------------------
# sleep_and_wait
# Starts a background sleep process for a specified duration and stores its PID in a file.
# Arguments:
#   --sleep-time <seconds> (optional): Number of seconds to sleep. Default is 60 seconds.
# Behavior:
#   - If a sleep process is already running (PID file exists), it will not start a new one.
#   - Prints the sleep duration in a human-readable format.
#   - Stores the PID of the sleep process in $SLEEP_PID_FILE.
#   - Waits for the sleep process to finish.
# ---------------------------------------------
sleep_and_wait() {
  # Check if a sleep process is already running
  if [ -f "$SLEEP_PID_FILE" ]; then
    echo "A sleep process is already running. PID file exists at $SLEEP_PID_FILE"
    echo "Use the 'kill' command first if you want to start a new sleep process."
    return 1
  fi

  # Set a default value for sleep_time if not provided
  sleep_time=60

  # Parse the --sleep-time flag if provided
  while [ $# -gt 0 ]; do
    case "$1" in
      --sleep-time)
        sleep_time=$2
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done

  if [ "$sleep_time" -gt 60 ]; then
    minutes=$((sleep_time / 60))
    seconds=$((sleep_time % 60))
    if [ "$seconds" -eq 0 ]; then
      echo "Sleeping for $minutes minutes..."
    else
      echo "Sleeping for $minutes minutes and $seconds seconds..."
    fi
  else
    echo "Sleeping for $sleep_time seconds..."
  fi
  # Sleep for the number of seconds passed as the first argument
  sleep $sleep_time &
  echo $! > $SLEEP_PID_FILE
  # Wait for the sleep process to finish
  wait $!
}

# ---------------------------------------------
# kill_process_by_pid_file (Deprecated)
# Kills a process using the PID stored in a PID file.
# Arguments:
#   None (uses the global $SLEEP_PID_FILE as the PID file).
# Behavior:
#   - If the PID file exists, reads the PID and attempts to kill the process.
#   - Removes the PID file after attempting to kill the process.
#   - Prints warnings if the PID file does not exist or the process is not found.
#   - Deprecated: Prefer using check_pid_status or other process management functions.
# ---------------------------------------------
kill_process_by_pid_file() {
  echo "Warning: kill_process_by_pid_file is deprecated. Use check_pid_status or other process management functions instead."
  # Check if the PID file exists
  PID_FILE="$SLEEP_PID_FILE"

  if [ -f "$PID_FILE" ]; then
    # Read the PID from the file
    PID=$(cat "$PID_FILE")
    
    # Check if the process is running and kill it
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID" && echo "Process $PID has been killed."
    else
      echo "No process found with PID $PID."
    fi
    
    # Remove the PID file
    rm -f "$PID_FILE"
  else
    echo "PID file does not exist."
  fi
}

# ---------------------------------------------
# kill_bun_processes (Deprecated)
# Kills all processes containing 'bun' in their command line.
# Arguments:
#   None.
# Behavior:
#   - Searches for all running processes with 'bun' in their command line (excluding the grep process itself).
#   - Attempts to kill each found process by PID.
#   - Prints a message for each process killed or if no processes are found.
#   - Deprecated: Prefer more specific process management methods.
# ---------------------------------------------
kill_bun_processes() {
  echo "Searching for bun processes..."
  # Find all processes containing 'bun' in their command line
  pids=$(ps aux | grep bun | grep -v grep | awk '{print $1}')
  
  if [ -z "$pids" ]; then
    echo "No bun processes found."
    return 0
  fi
  
  # Kill each process found
  for pid in $pids; do
    echo "Killing bun process with PID: $pid"
    kill -9 "$pid" 2>/dev/null || echo "Failed to kill process $pid"
  done
  
  echo "All bun processes have been terminated."
}

# ---------------------------------------------
# exec_command
# Executes a given command in the background and stores its PID in a file.
# Arguments:
#   $@ - The command and its arguments to execute.
# Behavior:
#   - Runs the specified command as a background process.
#   - Stores the PID of the background process in $COMMAND_PIDS_FILE.
#   - Prints the PID and command being executed.
#   - Waits for the background process to finish.
#   - Useful for tracking and managing multiple background processes in integration tests.
# ---------------------------------------------
exec_command() {
  COMMAND="$*"

  # Check if a command is provided
  if [ $# -eq 0 ]; then
    echo "Error: No command provided to execute."
    return 1
  fi

  # Execute the command in the background
  "$@" &
  PID=$!
  echo $PID >> "$COMMAND_PIDS_FILE"
  # echo "Command '$*' is running with PID $PID."
  # Wait for the command to finish
  wait $PID

  EXIT_CODE=$?

  # if killing with SIGKILL is in progress, return 0
  if [ "$EXIT_CODE" -eq 137 ]; then
    echo "Command '$COMMAND' with PID $PID was killed with SIGKILL."
    return 0
  fi

  # return the same exit code as the command
  return $EXIT_CODE
}

# ---------------------------------------------
# kill_all_exec_commands
# Kills all background processes started by exec_command using their stored PIDs.
# Arguments:
#   None.
# Behavior:
#   - Reads all PIDs from $COMMAND_PIDS_FILE.
#   - Attempts to kill each process by PID, skipping PID 1 and the sleep process.
#   - Prints a message for each process killed or if no PID file is found.
#   - Useful for cleaning up background processes started during integration tests.
# ---------------------------------------------
kill_all_exec_commands() {
  # Check if the PID file exists
  if [ ! -f "$COMMAND_PIDS_FILE" ]; then
    echo "No exec command PID file found."
    return 1
  fi

  kill_all_pids_excluding_1
}

# ---------------------------------------------
# clear_app_source_dir
# Removes all files and directories inside the application source directory ($APP_SOURCE_DIR).
# Arguments:
#   None.
# Behavior:
#   - Deletes all files and subdirectories within $APP_SOURCE_DIR, but not the directory itself.
#   - Prints a message indicating completion or if the directory does not exist.
#   - Useful for resetting the application state during integration tests.
# ---------------------------------------------
clear_app_source_dir() {
  # Remove all files and directories inside $APP_SOURCE_DIR, but not the directory itself
  if [ -d "$APP_SOURCE_DIR" ]; then
    rm -rf "$APP_SOURCE_DIR"/* "$APP_SOURCE_DIR"/.[!.]* "$APP_SOURCE_DIR"/..?* 2>/dev/null || true
    echo "All files in $APP_SOURCE_DIR have been deleted."
  else
    echo "$APP_SOURCE_DIR does not exist."
    return 1
  fi
}

# ---------------------------------------------
# compile_actioman_package
# Compiles the Actioman source directory and moves the generated package to the target location.
# Arguments:
#   None.
# Behavior:
#   - Generates a hash of all files in the src directory and saves it to /tmp/actioman-source.hash.
#   - Runs `bunx npm pack` in the directory specified by $ACTIOMAN_SHARE_DIR.
#   - Moves the resulting `actioman-*.tgz` file to the path specified by $ACTIOMAN_PACKAGE.
#   - Creates the parent directory of $ACTIOMAN_PACKAGE if it does not exist.
# ---------------------------------------------
compile_actioman_package() {
  # Check if the ACTIOMAN_SHARE_DIR exists
  if [ ! -d "$ACTIOMAN_SHARE_DIR" ]; then
    echo "Error: ACTIOMAN_SHARE_DIR does not exist: $ACTIOMAN_SHARE_DIR"
    return 1
  fi

  ACTIOMAN_SRC_HASH=""
  HASH_FILE="/tmp/actioman-source.hash"
  OLD_ACTIOMAN_SRC_HASH=""

  # Generate a hash of all files in the src directory and save it to a variable
  if [ -d "$ACTIOMAN_SHARE_DIR/src" ]; then
    ACTIOMAN_SRC_HASH=$(find "$ACTIOMAN_SHARE_DIR/src" -type f -not -name '*.spec.*' -not -path '*/__tests__/*' -exec sha256sum {} + | sort | sha256sum | awk '{print $1}')
  fi
    
  if [ -f "$HASH_FILE" ]; then
    OLD_ACTIOMAN_SRC_HASH=$(cat "$HASH_FILE")
  fi

  echo "Current source hash: $ACTIOMAN_SRC_HASH"
  echo "Previous source hash: $OLD_ACTIOMAN_SRC_HASH"

  if [ "$ACTIOMAN_SRC_HASH" = "$OLD_ACTIOMAN_SRC_HASH" ]; then
    echo "The source files have not changed. No need to recompile."
    return 0
  fi

  # Run npm pack in the source directory
  (cd "$ACTIOMAN_SHARE_DIR" && bunx npm pack)

  # Find the generated .tgz file
  local tgz_file
  tgz_file=$(ls "$ACTIOMAN_SHARE_DIR"/actioman-*.tgz | head -n 1)

  # Create the parent directory for the package if it does not exist
  mkdir -p "$(dirname "$ACTIOMAN_PACKAGE")"

  # Move the .tgz file to the target location
  mv "$tgz_file" "$ACTIOMAN_PACKAGE"

  echo "$ACTIOMAN_SRC_HASH" > "$HASH_FILE"
}

# ---------------------------------------------
# install_actioman_package
# Installs the Actioman package using Bun.
# Arguments:
#   None.
# Behavior:
#   - Runs `bun add` with the path specified by $ACTIOMAN_PACKAGE.
#   - Installs the Actioman package into the current working directory.
# ---------------------------------------------
install_actioman_package() {
  bun add "$ACTIOMAN_PACKAGE"
}

if [ -z "${1:-}" ]; then
  echo "Error: No command provided. Available commands are: sleep, kill, kill-bun, exec, kill-exec, clear-app-source, compile-actioman, install-actioman."
  exit 1
fi

case "$1" in
  sleep)
    shift
    sleep_and_wait "$@"
    ;;
  kill)
    shift
    kill_process_by_pid_file "$@"
    ;;
  kill-bun)
    shift
    kill_bun_processes "$@"
    ;;
  exec)
    shift
    exec_command "$@"
    ;;
  kill-exec)
    shift
    kill_all_exec_commands "$@"
    ;;
  clear-app-source)
    shift
    clear_app_source_dir "$@"
    ;;
  compile-actioman)
    shift
    compile_actioman_package "$@"
    ;;
  install-actioman)
    shift
    install_actioman_package "$@"
    ;;
  *)
    echo "Invalid command. Available commands are: sleep, kill, kill-bun, exec, kill-exec, clear-app-source, compile-actioman, install-actioman."
    exit 1
    ;;
esac
