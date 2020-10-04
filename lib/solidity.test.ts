import * as fc from "fast-check";
import {testProp} from "jest-fast-check";
import * as Arbitrary from "../test/arbitrary";
import * as Example from "../test/custom-example";
import {compileAbi} from "../test/compile-abi";

import * as Codec from "@truffle/codec";

import {Abi} from "./types";

import {generateSolidity} from "./solidity";

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
  testProp("compiles to input ABI", [Arbitrary.Abi()], (abi) => {
    fc.pre(abi.every(({type}) => type !== "constructor"));

    fc.pre(abi.length > 0);

    const output = generateSolidity({
      name: "MyInterface",
      abi,
      solidityVersion: "^0.7.0",
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

    const expectedAbi = new Set(
      removeProps(
        abi
          .filter(({type}) => type !== "constructor")
          .map((entry) => ({
            ...entry,
            type: entry.type || "function",
          }))
          .map((entry) => {
            if (entry.type !== "function") {
              return entry;
            }

            return {
              ...entry,
              outputs: (entry as any).outputs || [],
            };
          }),
        new Set(["payable", "constant"])
      )
    );

    expect(compiledAbi).toEqual(expectedAbi);
  });

  describe("custom example", () => {
    const abiWithoutConstructor = Codec.AbiData.Utils.schemaAbiToAbi(
      Example.abi.filter(({type}) => type !== "constructor")
    );

    const output = generateSolidity({
      name: "Example",
      abi: abiWithoutConstructor,
      solidityVersion: "^0.7.0",
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
});
