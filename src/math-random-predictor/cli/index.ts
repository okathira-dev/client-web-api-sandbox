import { runMathRandomCli } from "./mathRandomCli";

const exitCode = await runMathRandomCli(process.argv.slice(2));
process.exitCode = exitCode;
