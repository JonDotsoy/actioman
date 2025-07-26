import { cacheLocalPath } from "./cache_local_path";
/**
 * Static variable representing the local project cache directory URL for integration tests.
 * @type {URL}
 */
export const cacheProjectLocalPath = new URL("project/", cacheLocalPath);
