#!/usr/bin/env node

import { main } from "./cmds/main.js";

await main(process.argv.slice(2));
