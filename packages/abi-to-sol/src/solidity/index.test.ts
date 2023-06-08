import * as fc from "fast-check";
import { testProp } from "jest-fast-check";
import * as Abi from "@truffle/abi-utils";
import * as Example from "../../test/custom-example";
import { compileAbi } from "../../test/compile-abi";
import { excludesFunctionParameters } from "../../test/preflight";

import { generateSolidity } from ".";
import { GenerateSolidityMode } from "./options";

const removeProps = (obj: any, keys: Set<string>) => {
  if (obj instanceof Array) {
    for (const item of obj) {
      removeProps(item, keys);
    }
  } else if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (keys.has(key)) {
        delete obj[key];
      } else {
        removeProps(obj[key], keys);
      }
    }
  }

  return obj;
};

describe("generateSolidity", () => {
  testProp("respects output settings", [
    Abi.Arbitrary.Abi(),
    fc.constantFrom(GenerateSolidityMode.Normal, GenerateSolidityMode.Embedded),
    fc.boolean(), // outputAttribution
    fc.boolean(), // outputSource
  ], (abi, mode, outputAttribution, outputSource) => {
    fc.pre(abi.length > 0);

    const output = generateSolidity({
      name: "MyInterface",
      abi,
      solidityVersion: "^0.8.20",
      mode,
      outputAttribution,
      outputSource
    });

    const attributionOutput = output.indexOf("abi-to-sol") !== -1;
    const sourceOutput = output.indexOf("FROM THE FOLLOWING ABI JSON:") !== -1;
    const modeOutput = output.indexOf("SPDX-License-Identifier") === -1
      ? GenerateSolidityMode.Embedded
      : GenerateSolidityMode.Normal;

    expect(mode).toEqual(modeOutput);
    expect(outputAttribution).toEqual(attributionOutput);
    expect(outputSource).toEqual(sourceOutput);
  });

  testProp("compiles to input ABI", [Abi.Arbitrary.Abi()], (abi) => {
    fc.pre(
      abi.every((entry) => "type" in entry && entry.type !== "constructor")
    );
    fc.pre(excludesFunctionParameters(abi));

    fc.pre(abi.length > 0);

    const output = generateSolidity({
      name: "MyInterface",
      abi,
      solidityVersion: "^0.8.20",
    });

    let resultAbi;
    try {
      resultAbi = compileAbi(output);
    } catch (error) {
      console.log("Failed to compile. Solidity:\n%s", output);
      throw error;
    }

    const compiledAbi = new Set(
      removeProps(resultAbi, new Set(["internalType"]))
    );

    const expectedAbi = new Set(Abi.normalize(abi));

    expect(compiledAbi).toEqual(expectedAbi);
  },
  );

  describe("custom example", () => {
    const abiWithoutConstructor = Abi.normalize(
      Example.abi.filter(({type}) => type !== "constructor")
    );

    const output = generateSolidity({
      name: "Example",
      abi: abiWithoutConstructor,
      solidityVersion: "^0.8.4",
    });

    it("generates output", () => {
      const compiledAbi = compileAbi(output);

      const expectedAbi = abiWithoutConstructor.map((entry) => ({
        ...entry,
        type: entry.type || "function",
      }));

      expect(compiledAbi).toEqual(expectedAbi);
    });
  });

  describe("function pointers", () => {
    const abi: Abi.Abi = [
      {
        "inputs": [
          {
            "internalType": "function (uint256) external returns (uint256)",
            "name": "f",
            "type": "function"
          },
          {
            "internalType": "uint256[]",
            "name": "l",
            "type": "uint256[]"
          }
        ],
        "name": "map",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
      }
    ];

    const output = generateSolidity({
      name: "Example",
      abi,
      solidityVersion: "^0.8.13",
    });

    it("generates output", () => {
      const compiledAbi = compileAbi(output);
      expect(compiledAbi).toEqual(abi);
    });
  });

  describe("UDVT support", () => {
    const abi: Abi.Abi = [
      {
        "inputs": [
          {
            "internalType": "Int",
            "name": "i",
            "type": "int256"
          },
          {
            "internalType": "Example.Uint",
            "name": "u",
            "type": "uint256"
          },
          {
            "internalType": "Other.Bool",
            "name": "b",
            "type": "bool"
          }
        ],
        "name": "fnoo",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
      }
    ];

    const output = generateSolidity({
      name: "Example",
      abi,
      solidityVersion: "^0.8.13",
    });

    it("generates output", () => {
      const compiledAbi = compileAbi(output);
      expect(compiledAbi).toEqual(abi);
    });
  });
});
