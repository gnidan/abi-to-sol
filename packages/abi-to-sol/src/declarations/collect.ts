import type {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import type * as Abi from "@truffle/abi-utils";

import {Visitor, VisitOptions, dispatch, Node} from "../visitor";

import { Declarations, empty, merge } from "./types";
import { fromParameter } from "./fromParameter";

export const collectWithoutBindings = (node: Node) =>
  dispatch({ node, visitor: new DeclarationsCollector() });

interface Context {
}

type Visit<N extends Node> = VisitOptions<N, Context | undefined>;


class DeclarationsCollector
  implements Visitor<Declarations, Context | undefined>
{
  visitAbi({
    node: abi,
    context
  }: Visit<Abi.Abi>): Declarations {
    return abi
      .map(node => dispatch({ node, context, visitor: this }))
      .reduce(merge, empty());
  }

  visitEventEntry({
    node: entry,
    context
  }: Visit<Abi.EventEntry>): Declarations {
    return entry.inputs
      .map(node => dispatch({ node, context, visitor: this }))
      .reduce(merge, empty());
  }

  visitErrorEntry({
    node: entry,
    context
  }: Visit<Abi.ErrorEntry>): Declarations {
    return entry.inputs
      .map(node => dispatch({ node, context, visitor: this }))
      .reduce(merge, empty());
  }

  visitFunctionEntry({
    node: entry,
    context
  }: Visit<Abi.FunctionEntry>): Declarations {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map(node => dispatch({ node, context, visitor: this }))
      .reduce(merge, empty());
  }

  visitConstructorEntry({
    node: entry,
    context
  }: Visit<Abi.ConstructorEntry>): Declarations {
    return entry.inputs
      .map(node => dispatch({ node, context, visitor: this }))
      .reduce(merge, empty());
  }

  visitFallbackEntry({
    node: entry
  }: Visit<Abi.FallbackEntry>): Declarations {
    return empty();
  }

  visitReceiveEntry({
    node: entry,
  }: Visit<Abi.ReceiveEntry>): Declarations {
    return empty();
  }

  visitParameter({
    node: parameter
  }: Visit<Abi.Parameter>): Declarations {
    const { declarations } = fromParameter(parameter);
    return declarations;
  }
}
