export const getActiomanLockFileLocation = (cwd: URL) =>
  new URL("./.actioman.lock.json", cwd);
