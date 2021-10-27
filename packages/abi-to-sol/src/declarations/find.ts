import type * as Abi from "@truffle/abi-utils";

import { Parameter, isParameter } from "../parameter";

import { Identifier } from "./identifier";
import { Kind, HasBindings } from "./kind";
import { Declarations } from "./types";

export const find = (
  parameter: Abi.Parameter,
  declarations: Declarations<HasBindings>
): Kind<HasBindings> => {
  const { type } = parameter;

  if (!isParameter(parameter)) {
    throw new Error(
      `Parameter type \`${parameter.type}\` is not a valid ABI type`
    );
  }

  if (Parameter.isElementary(parameter)) {
    return findElementary(parameter, declarations);
  }

  if (Parameter.isArray(parameter)) {
    return findArray(parameter, declarations);
  }

  if (Parameter.isTuple(parameter)) {
    return findTuple(parameter, declarations);
  }

  throw new Error(`Unknown type ${type}`);
}

const findElementary = (
  parameter: Parameter.Elementary,
  declarations: Declarations<HasBindings>
): Kind<HasBindings> => {
  if (!Parameter.isUserDefinedValueType(parameter)) {
    const { type, internalType } = parameter;
    return {
      type,
      ...(
        internalType
          ? { hints: { internalType } }
          : {}
      )
    }
  }

  const { name, scope } = Parameter.UserDefinedValueType.recognize(
    parameter
  );
  const identifier = Identifier.UserDefinedValueType.create({ name, scope });
  const reference = Identifier.toReference(identifier);

  const kind = declarations.byIdentifierReference[reference];

  if (!kind) {
    throw new Error(
      `Unknown declaration with identifier reference ${reference}`
    );
  }

  return kind;
};

const findArray = (
  parameter: Parameter.Array,
  declarations: Declarations<HasBindings>
): Kind<HasBindings> => {
  const itemParameter = Parameter.Array.item(parameter);

  const itemKind = find(itemParameter, declarations);

  return {
    itemKind,
    ...(
      Parameter.Array.isStatic(parameter)
        ? { length: Parameter.Array.Static.length(parameter) }
        : {}
    )
  };
}

const findTuple = (
  parameter: Parameter.Tuple,
  declarations: Declarations<HasBindings>
): Kind<HasBindings> => {
  const {
    signature,
    name,
    scope
  } = Parameter.Tuple.recognize(parameter);

  const identifier = name
    ? Identifier.Struct.create({ name, scope })
    : undefined;

  if (identifier) {
    const reference = Identifier.toReference(identifier);

    const kind = declarations.byIdentifierReference[reference];

    if (!kind) {
      throw new Error(
        `Unknown declaration with identifier reference ${reference}`
      );
    }

    return kind;
  }

  // reaching here guarantees no internalType specified for `parameter`
  // so only match declarations that also have no internalType

  const kind = Object.values(declarations.byIdentifierReference)
    .find(kind =>
      Kind.isStruct(kind) &&
      kind.signature === signature &&
      !kind.hints?.internalType
    )

  if (!kind) {
    throw new Error(
      `Unknown declaration with tuple signature ${signature}`
    );
  }

  return kind;
}
