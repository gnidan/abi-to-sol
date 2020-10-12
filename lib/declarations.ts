import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Codec from "@truffle/codec";
import * as Abi from "@truffle/abi-utils";

import {Visitor, VisitOptions, dispatch, Node} from "./visitor";

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
  visitAbi({node: nodes}: VisitOptions<Abi.Abi>): Declarations {
    return nodes
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitEventEntry({node: entry}: VisitOptions<Abi.EventEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitFunctionEntry({
    node: entry,
  }: VisitOptions<Abi.FunctionEntry>): Declarations {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => ({...a, ...b}), {});
  }

  visitFallbackEntry({
    node: entry,
  }: VisitOptions<Abi.FallbackEntry>): Declarations {
    return {};
  }

  visitReceiveEntry({
    node: entry,
  }: VisitOptions<Abi.ReceiveEntry>): Declarations {
    return {};
  }

  visitParameter({node: parameter}: VisitOptions<Abi.Parameter>): Declarations {
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
        .map((component: Abi.Parameter) =>
          this.visitParameter({node: component})
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
