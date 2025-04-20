/**
 * Options for killing a Docker container in integration tests.
 * @property {boolean} [verbose] - If true, enables verbose logging during container shutdown.
 */
export type killContainerOptions = {
  verbose?: boolean;
};
