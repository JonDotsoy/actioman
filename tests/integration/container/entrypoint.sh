#!/bin/sh

# Enable error handling: exit on error, unset variables, and pipe failures
set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error

# Global variable for the PID file path
SLEEP_PID_FILE="/tmp/sleep_pid.tmp"
COMMAND_PIDS_FILE="/tmp/command_pid.tmp"
APP_SOURCE_DIR="/app"

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

# Mata todos los procesos numéricos en /proc excepto el PID 1 y el PID guardado en SLEEP_PID_FILE
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

# Deprecated: Use check_pid_status or other process management functions instead.
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

# Deprecated function
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

exec_command() {
  # Check if a command is provided
  if [ $# -eq 0 ]; then
    echo "Error: No command provided to execute."
    return 1
  fi

  # Execute the command in the background
  "$@" &
  PID=$!
  echo $PID >> "$COMMAND_PIDS_FILE"
  echo "Command '$*' is running with PID $PID."
  # Wait for the command to finish
  wait $PID
}

kill_all_exec_commands() {
  # Check if the PID file exists
  if [ ! -f "$COMMAND_PIDS_FILE" ]; then
    echo "No exec command PID file found."
    return 1
  fi

  kill_all_pids_excluding_1
}

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

if [ -z "${1:-}" ]; then
  echo "Error: No command provided. Available commands are: sleep, kill, kill-bun, exec, kill-exec, clear-app-source."
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
  *)
    echo "Invalid command. Available commands are: sleep, kill, kill-bun, exec, kill-exec, clear-app-source."
    exit 1
    ;;
esac
