import { Abi as SchemaAbi } from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";
import * as Abi from "@truffle/abi-utils";

import { Visitor, VisitOptions, dispatch, Node } from "./visitor";

export const allFeatures = ["defines-receive", "defines-fallback"] as const;

export type AbiFeature = typeof allFeatures[number];
export type AbiFeatures = Set<AbiFeature>;

export const collectAbiFeatures = (node: SchemaAbi | Node) =>
  dispatch({
    node,
    visitor: new AbiFeaturesCollector(),
  });

export class AbiFeaturesCollector implements Visitor<AbiFeatures> {
  visitAbi({ node: nodes }: VisitOptions<Abi.Abi>): AbiFeatures {
    return nodes
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => new Set([...a, ...b]), new Set<AbiFeature>());
  }

  visitEventEntry({ node: entry }: VisitOptions<Abi.EventEntry>): AbiFeatures {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => new Set([...a, ...b]), new Set<AbiFeature>());
  }

  visitFunctionEntry({
    node: entry,
  }: VisitOptions<Abi.FunctionEntry>): AbiFeatures {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => new Set([...a, ...b]), new Set<AbiFeature>());
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): AbiFeatures {
    return entry.inputs
      .map((node) => dispatch({ node, visitor: this }))
      .reduce((a, b) => new Set([...a, ...b]), new Set<AbiFeature>());
  }

  visitFallbackEntry({
    node: entry,
  }: VisitOptions<Abi.FallbackEntry>): AbiFeatures {
    return new Set(["defines-fallback"]);
  }

  visitReceiveEntry({
    node: entry,
  }: VisitOptions<Abi.ReceiveEntry>): AbiFeatures {
    return new Set(["defines-receive"]);
  }

  visitParameter({
    node: parameter,
  }: VisitOptions<Abi.Parameter>): AbiFeatures {
    return new Set();
  }
}
