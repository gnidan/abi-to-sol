import { Abi as SchemaAbi } from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";
import * as Abi from "@truffle/abi-utils";

import { Visitor, VisitOptions, dispatch, Node } from "./visitor";

export const allFeatures = [
  "defines-receive",
  "defines-fallback",
  "needs-abiencoder-v2",
  "defines-error",
] as const;

export type AbiFeature = typeof allFeatures[number];
export type AbiFeatures = Partial<{
  [F in AbiFeature]: true
}>;

export const collectAbiFeatures = (node: SchemaAbi | Node) =>
  dispatch({
    node,
    visitor: new AbiFeaturesCollector(),
  });

export class AbiFeaturesCollector implements Visitor<AbiFeatures> {
  visitAbi({ node: nodes }: VisitOptions<Abi.Abi>): AbiFeatures {
    return nodes
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitEventEntry({ node: entry }: VisitOptions<Abi.EventEntry>): AbiFeatures {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitErrorEntry({ node: entry }: VisitOptions<Abi.ErrorEntry>): AbiFeatures {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitFunctionEntry({
    node: entry,
  }: VisitOptions<Abi.FunctionEntry>): AbiFeatures {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): AbiFeatures {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitFallbackEntry({
    node: entry,
  }: VisitOptions<Abi.FallbackEntry>): AbiFeatures {
    return { "defines-fallback": true };
  }

  visitReceiveEntry({
    node: entry,
  }: VisitOptions<Abi.ReceiveEntry>): AbiFeatures {
    return { "defines-receive": true };
  }

  visitParameter({
    node: parameter,
  }: VisitOptions<Abi.Parameter>): AbiFeatures {
    if (
      parameter.type.startsWith("tuple") || // anything with tuples
      parameter.type.includes("string[") || // arrays of strings
      parameter.type.includes("bytes[") || // arrays of bytes
      parameter.type.includes("][") // anything with nested arrays
    ) {
      return { "needs-abiencoder-v2": true };
    }

    return {};
  }
}
