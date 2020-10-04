import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";

const solc = require("solc");

export const compileAbi = (content: string): SchemaAbi => {
  const source = "interface.sol";

  const input = {
    language: "Solidity",
    sources: {
      [source]: {
        content,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi"],
        },
      },
    },
  };

  const output: any = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors || []).filter(
    ({type}: any) => type !== "Warning"
  );
  if (errors.length > 0) {
    console.error(errors);
  }
  const {contracts} = output;
  const sourceOutput: any = contracts[source];

  return (Object.values(sourceOutput)[0] as any).abi;
};
