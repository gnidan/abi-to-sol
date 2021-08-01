import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";
import * as Abi from "@truffle/abi-utils";

import {Visitor, VisitOptions, dispatch, Node} from "../src/visitor";

export const excludesFunctionParameters = (node: SchemaAbi | Abi.Abi) =>
  dispatch({
    node,
    // @ts-ignore
    visitor: new FunctionParameterExcluder(),
  });

class FunctionParameterExcluder implements Visitor<boolean> {
  visitAbi({node: entries}: VisitOptions<Abi.Abi>): boolean {
    return entries
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);
  }

  visitFunctionEntry({node: entry}: VisitOptions<Abi.FunctionEntry>): boolean {
    const {inputs, outputs} = entry;

    const inputsExcludeFunctions = inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);

    const outputsExcludeFunctions = outputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);

    return inputsExcludeFunctions && outputsExcludeFunctions;
  }

  visitConstructorEntry({
    node: entry,
  }: VisitOptions<Abi.ConstructorEntry>): boolean {
    const {inputs} = entry;

    return inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);
  }

  visitFallbackEntry({node: entry}: VisitOptions<Abi.FallbackEntry>): boolean {
    return true;
  }

  visitReceiveEntry({node: entry}: VisitOptions<Abi.ReceiveEntry>): boolean {
    return true;
  }

  visitEventEntry({node: entry}: VisitOptions<Abi.EventEntry>): boolean {
    const {inputs} = entry;

    return inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);
  }

  visitErrorEntry({node: entry}: VisitOptions<Abi.ErrorEntry>): boolean {
    const {inputs} = entry;

    return inputs
      .map((node) => dispatch({node, visitor: this}))
      .reduce((a, b) => a && b, true);
  }

  visitParameter({node: parameter}: VisitOptions<Abi.Parameter>): boolean {
    if (parameter.type.startsWith("function")) {
      return false;
    }

    const {components} = parameter;

    if (components) {
      return components
        .map((node) => dispatch({node, visitor: this}))
        .reduce((a, b) => a && b, true);
    }

    return true;
  }
}
