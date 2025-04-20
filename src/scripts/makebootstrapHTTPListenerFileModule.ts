import { getBootstrapFilesLocation } from "../bootstrap-files-location/bootstrap-files-location.js";

export const makebootstrapHTTPListenerFileModule = (cwd: URL) =>
  getBootstrapFilesLocation();
