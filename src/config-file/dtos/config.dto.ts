import type { Integration } from "../../configs/configs.js";

/**
 * Configuration options for Actioman
 */
export type Config = {
  /**
   * Array of integrations to be loaded by Actioman
   * Each integration provides additional functionality or connects with external services
   */
  integrations?: Integration[];

  /**
   * Server configuration options
   */
  server?: {
    /**
     * Port number the server will listen on
     * @default 3000
     */
    port?: number;

    /**
     * Server host to bind to
     * @deprecated Use hostname instead
     */
    host?: string;

    /**
     * Server hostname to bind to
     * @default "localhost"
     */
    hostname?: string;

    /**
     * Default HTTP headers to include with all responses
     * Key-value pairs where values can be a single string or array of strings
     */
    headers?: Record<string, string | string[]>;

    /**
     * SSL configuration for HTTPS
     * Both key and certificate files are required when enabling SSL
     */
    ssl?: {
      /**
       * Path to the SSL private key file
       */
      key: string;

      /**
       * Path to the SSL certificate file
       */
      cert: string;
    };
  };
};
