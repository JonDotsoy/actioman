// @ts-nocheck
import { actions } from "actioman";
const firstService = actions.firstService();
const secondService = actions.secondService();
console.log(await firstService.hello());
console.log(await secondService.hello());
