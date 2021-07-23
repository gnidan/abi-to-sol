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
  signatureDeclarations: {
    [signature: string]: Declaration;
  };
  containerSignatures: {
    [container: string]: string[];
  }
}

export class DeclarationsCollector implements Visitor<Declarations> {
  visitAbi({node: nodes}: VisitOptions<Abi.Abi>): Declarations {
    return nodes
      .map((node) => dispatch({node, visitor: this}))
      .reduce(mergeDeclarations, emptyDeclarations());
  }

  visitEventEntry({node: entry}: VisitOptions<Abi.EventEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce(mergeDeclarations, emptyDeclarations());
  }

  visitFunctionEntry({
    node: entry,
  }: VisitOptions<Abi.FunctionEntry>): Declarations {
    return [...entry.inputs, ...(entry.outputs || [])]
      .map((node) => dispatch({node, visitor: this}))
      .reduce(mergeDeclarations, emptyDeclarations());
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): Declarations {
    return entry.inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce(mergeDeclarations, emptyDeclarations());
  }

  visitFallbackEntry({
    node: entry,
  }: VisitOptions<Abi.FallbackEntry>): Declarations {
    return emptyDeclarations();
  }

  visitReceiveEntry({
    node: entry,
  }: VisitOptions<Abi.ReceiveEntry>): Declarations {
    return emptyDeclarations();
  }

  visitParameter({node: parameter}: VisitOptions<Abi.Parameter>): Declarations {
    if (!parameter.type.startsWith("tuple")) {
      return emptyDeclarations();
    }

    let container = "";
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
        const possiblyQualifiedIdentifier = match[1];
        const parts = possiblyQualifiedIdentifier.split(".");
        if (parts.length === 1) {
          declaration.identifier = parts[0];
        } else if (parts.length === 2) {
          container = parts[0];
          declaration.identifier = parts[1];
        }
      }
    }

    const declarations = {
      signatureDeclarations: {
        [signature]: declaration
      },
      containerSignatures: {
        [container]: [signature]
      }
    };

    const componentDeclarations: Declarations = components
      .map((component: Abi.Parameter) =>
        this.visitParameter({node: component})
      )
      .reduce(mergeDeclarations, emptyDeclarations())


    return mergeDeclarations(declarations, componentDeclarations);
  }
}

export const collectDeclarations = (node: SchemaAbi | Node) =>
  dispatch({
    node,
    visitor: new DeclarationsCollector(),
  });

function mergeDeclarations(
  a: Declarations,
  b: Declarations
): Declarations {
  const declarations: Declarations = {
    signatureDeclarations: {
      ...a.signatureDeclarations,
      ...b.signatureDeclarations
    },
    containerSignatures: {
      ...a.containerSignatures,
      // add b iteratively separately to merge arrays
    }
  };

  for (const [container, signatures] of Object.entries(b.containerSignatures)) {
    const mergedSignatures = new Set([
      ...(declarations.containerSignatures[container] || []),
      ...signatures
    ])

    declarations.containerSignatures[container] = [...mergedSignatures];
  }

  return declarations;
}

function emptyDeclarations(): Declarations {
  return {
    signatureDeclarations: {},
    containerSignatures: {}
  };
}
