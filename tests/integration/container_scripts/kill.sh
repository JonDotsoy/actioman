#!/bin/sh

# Check if the PID file exists
PID_FILE="/tmp/sleep_pid.tmp"

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