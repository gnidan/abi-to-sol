import * as fc from "fast-check";
import {testProp} from "jest-fast-check";
import * as Abi from "@truffle/abi-utils";
import * as Example from "../test/custom-example";
import {compileAbi} from "../test/compile-abi";
import {excludesFunctionParameters} from "../test/preflight";

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
  testProp("compiles to input ABI", [Abi.Arbitrary.Abi()], (abi) => {
    fc.pre(
      abi.every((entry) => "type" in entry && entry.type !== "constructor")
    );
    fc.pre(excludesFunctionParameters(abi));

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

    const expectedAbi = new Set(Abi.normalize(abi));

    expect(compiledAbi).toEqual(expectedAbi);
  });

  describe("custom example", () => {
    const abiWithoutConstructor = Abi.normalize(
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
