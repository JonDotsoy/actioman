/**
 * Static variable for the file path where the container PID is stored during integration tests.
 * @type {string}
 */
export const containerPidPath = new URL(
  "../../../.container_pid",
  import.meta.url,
);
