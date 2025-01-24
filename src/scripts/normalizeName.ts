export const normalizeName = (name: string) => {
  const pipes: ((value: string) => string)[] = [
    (value) => value.replace(/\W+/g, " "),
    (value) => value.trim(),
    (value) => value.replace(/\s+(\w)/g, (_, e) => e.toUpperCase()),
    (value) => value.replace(/^([^a-z_])/, "_$1"),
  ];
  return pipes.reduce((acc, fn) => fn(acc), name);
};
