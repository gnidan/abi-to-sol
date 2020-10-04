import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";

import Abi = Codec.AbiData.Abi;
import AbiEntry = Codec.AbiData.AbiEntry;
import FunctionAbiEntry = Codec.AbiData.FunctionAbiEntry;
import ConstructorAbiEntry = Codec.AbiData.ConstructorAbiEntry;
import FallbackAbiEntry = Codec.AbiData.FallbackAbiEntry;
import ReceiveAbiEntry = Codec.AbiData.ReceiveAbiEntry;
import EventAbiEntry = Codec.AbiData.EventAbiEntry;
import AbiParameter = Codec.AbiData.AbiParameter;

export type Node =
  | Abi
  | AbiEntry
  | FunctionAbiEntry
  | ConstructorAbiEntry
  | FallbackAbiEntry
  | ReceiveAbiEntry
  | EventAbiEntry
  | AbiParameter;

export {
  Abi,
  AbiEntry,
  FunctionAbiEntry,
  ConstructorAbiEntry,
  FallbackAbiEntry,
  ReceiveAbiEntry,
  EventAbiEntry,
  AbiParameter,
};

export const isAbi = (node: Node | SchemaAbi): node is Abi | SchemaAbi =>
  node instanceof Array;

export const isAbiEntry = (node: Node): node is AbiEntry =>
  typeof node === "object" &&
  "type" in node &&
  ["function", "constructor", "fallback", "receive", "event"].includes(
    node.type
  ) &&
  (node.type !== "function" || "stateMutability" in node || "constant" in node);
