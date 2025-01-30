export const getCWD = (cwd?: string) =>
  new URL(cwd ?? "./", new URL(`${process.cwd()}/`, "file://"));
