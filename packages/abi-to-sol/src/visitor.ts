import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Abi from "@truffle/abi-utils";

export interface VisitOptions<N extends Node, C = undefined> {
  node: N;
  context?: C;
}

export interface Visitor<T, C = undefined> {
  visitAbi(options: VisitOptions<Abi.Abi, C>): T;
  visitFunctionEntry(options: VisitOptions<Abi.FunctionEntry, C>): T;
  visitConstructorEntry(options: VisitOptions<Abi.ConstructorEntry, C>): T;
  visitFallbackEntry(options: VisitOptions<Abi.FallbackEntry, C>): T;
  visitReceiveEntry(options: VisitOptions<Abi.ReceiveEntry, C>): T;
  visitEventEntry(options: VisitOptions<Abi.EventEntry, C>): T;
  visitParameter(options: VisitOptions<Abi.Parameter, C>): T;
}

export interface DispatchOptions<T, C> {
  node: Node | SchemaAbi;
  visitor: Visitor<T, C>;
  context?: C;
}

export type Node =
  | Abi.Abi
  | Abi.Entry
  | Abi.FunctionEntry
  | Abi.ConstructorEntry
  | Abi.FallbackEntry
  | Abi.ReceiveEntry
  | Abi.EventEntry
  | Abi.Parameter
  | Abi.EventParameter;

export const dispatch = <T, C>(options: DispatchOptions<T, C>): T => {
  const {node, visitor, context} = options;

  if (isAbi(node)) {
    return visitor.visitAbi({
      node: Abi.normalize(node),
      context,
    });
  }

  if (isEntry(node)) {
    switch (node.type) {
      case "function":
        return visitor.visitFunctionEntry({node, context});
      case "constructor":
        return visitor.visitConstructorEntry({node, context});
      case "fallback":
        return visitor.visitFallbackEntry({node, context});
      case "receive":
        return visitor.visitReceiveEntry({node, context});
      case "event":
        return visitor.visitEventEntry({node, context});
    }
  }

  return visitor.visitParameter({node, context});
};

const isAbi = (node: Node | SchemaAbi): node is Abi.Abi | SchemaAbi =>
  node instanceof Array;

const isEntry = (node: Node): node is Abi.Entry =>
  typeof node === "object" &&
  "type" in node &&
  ["function", "constructor", "fallback", "receive", "event"].includes(
    node.type
  ) &&
  (node.type !== "function" || "stateMutability" in node || "constant" in node);
