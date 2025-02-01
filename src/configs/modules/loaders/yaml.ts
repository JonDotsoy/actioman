import * as yaml from "yaml";
import * as fs from "fs/promises";

export default async (sourceLocation: string) => {
  const payload = await fs.readFile(new URL(sourceLocation), "utf-8");
  return yaml.parse(payload);
};
