import type Prettier from "prettier";

import { Declarations } from "../declarations";

import * as defaults from "./defaults";
import * as Features from "./features";
import { GenerateSolidityOptions } from "./options";
import { generateRawSolidity } from "./generate";
import { analyze } from "./analyze";

export { defaults };
export { GenerateSolidityOptions, GenerateSolidityMode } from "./options";

let prettier: typeof Prettier
try {
  prettier = require("prettier");
} catch {
  // no-op
}

export const generateSolidity = ({
  abi,
  name = defaults.name,
  solidityVersion = defaults.solidityVersion,
  license = defaults.license,
  mode = defaults.mode,
  outputAttribution = defaults.outputAttribution,
  outputSource = defaults.outputSource,
  prettifyOutput = prettier && defaults.prettifyOutput,
}: GenerateSolidityOptions) => {
  if (!prettier && prettifyOutput) {
    throw new Error("Could not require() prettier");
  }

  const versionsFeatures = Features.forRange(solidityVersion);
  const abiProperties = analyze(abi);
  const declarations = Declarations.collect(abi);

  const raw = generateRawSolidity(abi, {
    name,
    solidityVersion,
    license,
    mode,
    outputAttribution,
    outputSource,
    versionsFeatures,
    abiProperties,
    declarations
  });

  if (!prettifyOutput) {
    return raw;
  }

  try {
    return prettier.format(raw, {
      plugins: ["prettier-plugin-solidity"],
      // @ts-ignore
      parser: "solidity-parse",
    });
  } catch (error) {
    return raw;
  }
};
