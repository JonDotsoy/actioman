#!/usr/bin/env node

import {
  flag,
  flags,
  command,
  type Rule,
  rule,
  isStringAt,
} from "@jondotsoy/flags";

const args = process.argv.slice(2);

const main = async (args: string[]) => {
  type Options = {};
  const rules: Rule<Options>[] = [
    // rule(flag(), isStringAt('name')),
  ];
  const options = flags(args, {}, rules);
};

main(args).catch((err) => {
  process.exitCode = 1;
  console.error(err);
});
