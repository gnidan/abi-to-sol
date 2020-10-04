import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";

import {
  Node,
  isAbi,
  isAbiEntry,
  Abi,
  FunctionAbiEntry,
  ConstructorAbiEntry,
  FallbackAbiEntry,
  ReceiveAbiEntry,
  EventAbiEntry,
  AbiParameter,
} from "./types";

export interface VisitOptions<N extends Node, C = undefined> {
  node: N;
  context?: C;
}

export interface Visitor<T, C = undefined> {
  visitAbi(options: VisitOptions<Abi, C>): T;
  visitFunctionAbiEntry(options: VisitOptions<FunctionAbiEntry, C>): T;
  visitConstructorAbiEntry(options: VisitOptions<ConstructorAbiEntry, C>): T;
  visitFallbackAbiEntry(options: VisitOptions<FallbackAbiEntry, C>): T;
  visitReceiveAbiEntry(options: VisitOptions<ReceiveAbiEntry, C>): T;
  visitEventAbiEntry(options: VisitOptions<EventAbiEntry, C>): T;
  visitAbiParameter(options: VisitOptions<AbiParameter, C>): T;
}

export interface DispatchOptions<T, C> {
  node: Node | SchemaAbi;
  visitor: Visitor<T, C>;
  context?: C;
}

export const dispatch = <T, C>(options: DispatchOptions<T, C>): T => {
  const {node, visitor, context} = options;

  if (isAbi(node)) {
    return visitor.visitAbi({
      node: Codec.AbiData.Utils.schemaAbiToAbi(node),
      context,
    });
  } else if (isAbiEntry(node)) {
    switch (node.type) {
      case "function":
        return visitor.visitFunctionAbiEntry({node, context});
      case "constructor":
        return visitor.visitConstructorAbiEntry({node, context});
      case "fallback":
        return visitor.visitFallbackAbiEntry({node, context});
      case "receive":
        return visitor.visitReceiveAbiEntry({node, context});
      case "event":
        return visitor.visitEventAbiEntry({node, context});
    }
  } else {
    return visitor.visitAbiParameter({node, context});
  }
};
