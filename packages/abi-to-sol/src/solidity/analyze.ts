import type { Abi as SchemaAbi } from "@truffle/contract-schema/spec";
import type * as Abi from "@truffle/abi-utils";

import { Visitor, VisitOptions, dispatch, Node } from "../visitor";

export const observableProperties = [
  "defines-receive",
  "defines-fallback",
  "needs-abiencoder-v2",
  "defines-error",
] as const;

export type AbiProperty = typeof observableProperties[number];
export type AbiProperties = Partial<{
  [F in AbiProperty]: true
}>;

export const analyze = (node: SchemaAbi | Node) =>
  dispatch({
    node,
    visitor: new AbiPropertiesCollector(),
  });

export class AbiPropertiesCollector implements Visitor<AbiProperties> {
  visitAbi({ node: nodes }: VisitOptions<Abi.Abi>): AbiProperties {
    return nodes
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitEventEntry({ node: entry }: VisitOptions<Abi.EventEntry>): AbiProperties {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitErrorEntry({ node: entry }: VisitOptions<Abi.ErrorEntry>): AbiProperties {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitFunctionEntry({
    node: entry,
  }: VisitOptions<Abi.FunctionEntry>): AbiProperties {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): AbiProperties {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }

  visitFallbackEntry({
    node: entry,
  }: VisitOptions<Abi.FallbackEntry>): AbiProperties {
    return { "defines-fallback": true };
  }

  visitReceiveEntry({
    node: entry,
  }: VisitOptions<Abi.ReceiveEntry>): AbiProperties {
    return { "defines-receive": true };
  }

  visitParameter({
    node: parameter,
  }: VisitOptions<Abi.Parameter>): AbiProperties {
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
