export default async (sourceLocation: string) => {
  const { default: def } = await import(sourceLocation);
  return def;
};
