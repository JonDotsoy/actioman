/**
 * Options for bootstrapping a Docker container in integration tests.
 * @property {boolean} [verbose] - If true, enables verbose logging during container startup.
 * @property {number} [timeoutSeconds] - Timeout in seconds for container startup.
 */
export type bootstrapContainerOptions = {
  verbose?: boolean;
  timeoutSeconds?: number;
};
