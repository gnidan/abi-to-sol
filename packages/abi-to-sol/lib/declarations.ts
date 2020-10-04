import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";

import {
  Node,
  Abi,
  AbiParameter,
  EventAbiEntry,
  FunctionAbiEntry,
  ConstructorAbiEntry,
  FallbackAbiEntry,
  ReceiveAbiEntry,
} from "./types";
import {Visitor, VisitOptions, dispatch} from "./visitor";

export interface Component {
  name: string;
  type: string;
  signature?: string;
}

export interface Declaration {
  identifier?: string;
  components: Component[];
}

export interface Declarations {
  [signature: string]: Declaration;
}

export class DeclarationsCollector implements Visitor<Declarations> {
  visitAbi({node: nodes}: VisitOptions<Abi>): Declarations {
    return nodes
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitEventAbiEntry({node: entry}: VisitOptions<EventAbiEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitFunctionAbiEntry({
    node: entry,
  }: VisitOptions<FunctionAbiEntry>): Declarations {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitConstructorAbiEntry({
    node: entry,
  }: VisitOptions<ConstructorAbiEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitFallbackAbiEntry({
    node: entry,
  }: VisitOptions<FallbackAbiEntry>): Declarations {
    return {};
  }

  visitReceiveAbiEntry({
    node: entry,
  }: VisitOptions<ReceiveAbiEntry>): Declarations {
    return {};
  }

  visitAbiParameter({
    node: parameter,
  }: VisitOptions<AbiParameter>): Declarations {
    if (!parameter.type.startsWith("tuple")) {
      return {};
    }

    const components = parameter.components || [];
    const signature = Codec.AbiData.Utils.abiTupleSignature(components);
    const declaration: Declaration = {
      components: components.map(({name, type, components}) =>
        !components
          ? {name, type}
          : {
              name,
              type,
              signature: Codec.AbiData.Utils.abiTupleSignature(components),
            }
      ),
    };

    if ("internalType" in parameter && parameter.internalType) {
      const match = parameter.internalType.match(/struct ([^\[]+).*/);
      if (match) {
        declaration.identifier = match[1];
      }
    }

    const declarations = {
      ...components
        .map((component: AbiParameter) =>
          this.visitAbiParameter({node: component})
        )
        .reduce((a, b) => ({...a, ...b}), {}),

      [signature]: declaration,
    };

    return declarations;
  }
}

export const collectDeclarations = (node: SchemaAbi | Node) =>
  dispatch({
    node,
    visitor: new DeclarationsCollector(),
  });
