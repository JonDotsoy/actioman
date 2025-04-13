#!/bin/sh

# Sleep for the number of seconds passed as the first argument
sleep $1 &
echo $! > /tmp/sleep_pid.tmp
# Wait for the sleep process to finish
wait $!
