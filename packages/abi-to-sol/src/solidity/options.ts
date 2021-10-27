import type * as Abi from "@truffle/abi-utils";
import type {Abi as SchemaAbi} from "@truffle/contract-schema/spec";

export enum GenerateSolidityMode {
  Normal = "normal",
  Embedded = "embedded"
}

export interface GenerateSolidityOptions {
  abi: Abi.Abi | SchemaAbi;
  name?: string;
  solidityVersion?: string;
  license?: string;
  mode?: GenerateSolidityMode;
  outputAttribution?: boolean;
  outputSource?: boolean;
  prettifyOutput?: boolean;
}
