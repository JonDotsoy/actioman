/**
 * Options for bootstrapping a Docker container in integration tests.
 * @property {boolean} [verbose] - If true, enables verbose logging during container startup.
 */
export type bootstrapContainerOptions = {
  verbose?: boolean;
};
