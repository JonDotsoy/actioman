export function* listNodeModulesPaths(cwd: URL): Generator<URL> {
  const proposalNodeModules = new URL("./node_modules/", cwd);
  yield proposalNodeModules;
  const parent = new URL("../", cwd);
  if (parent.pathname === cwd.pathname) return;
  yield* listNodeModulesPaths(parent);
}
