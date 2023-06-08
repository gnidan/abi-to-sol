import type * as Abi from "@truffle/abi-utils";

import { Parameter, isParameter } from "../parameter";

import { Identifier } from "./identifier";
import { Kind, MissingBindings } from "./kind";
import { Declarations, empty, merge, from } from "./types";

export interface FromParameterResult {
  parameterKind: Kind<MissingBindings>;
  declarations: Declarations<MissingBindings>;
}

export const fromParameter = (
  parameter: Abi.Parameter
): FromParameterResult => {
  if (!isParameter(parameter)) {
    throw new Error(
      `Parameter type \`${parameter.type}\` is not a valid ABI type`
    );
  }

  if (Parameter.isElementary(parameter)) {
    return fromElementaryParameter(parameter);
  }

  if (Parameter.isArray(parameter)) {
    return fromArrayParameter(parameter);
  }

  if (Parameter.isTuple(parameter)) {
    return fromTupleParameter(parameter);
  }

  throw new Error(`Unexpectedly could not convert Abi.Parameter to Kind`);
};

const fromElementaryParameter = (
  parameter: Parameter.Elementary
): FromParameterResult => {
  if (Parameter.isUserDefinedValueType(parameter)) {
    const { name, scope } = Parameter.UserDefinedValueType.recognize(
      parameter
    );
    const identifier = Identifier.UserDefinedValueType.create({ name, scope });

    const { type, internalType } = parameter;

    const parameterKind: Kind.UserDefinedValueType = {
      type,
      hints: { internalType },
      identifier
    };

    return {
      parameterKind,
      declarations: from(parameterKind)
    }
  }

  const { type, internalType } = parameter;

  const parameterKind: Kind.Elementary = {
    type,
    ...(
      internalType
        ? { hints: { internalType } }
        : {}
    )
  };

  return {
    parameterKind,
    declarations: from(parameterKind)
  }
}

const fromArrayParameter = (
  parameter: Parameter.Array
): FromParameterResult => {
  const itemParameter = Parameter.Array.item(parameter);

  const {
    parameterKind: itemKind,
    declarations
  } = fromParameter(itemParameter);

  const parameterKind: Kind.Array<MissingBindings> = {
    itemKind,
    ...(
      Parameter.Array.isStatic(parameter)
        ? { length: Parameter.Array.Static.length(parameter) }
        : {}
    )
  };

  return {
    declarations,
    parameterKind
  };
};

const fromTupleParameter = (
  parameter: Parameter.Tuple
): FromParameterResult => {
  const {
    internalType,
    components
  } = parameter;

  const {
    signature,
    name,
    scope
  } = Parameter.Tuple.recognize(parameter);

  const identifier = name
    ? Identifier.Struct.create({ name, scope })
    : undefined;

  const memberResults: {
    member: Kind.Struct.Member<MissingBindings>;
    declarations: Declarations<MissingBindings>
  }[] = components.map(component => {
    const { name } = component;

    const {
      parameterKind: kind,
      declarations
    } = fromParameter(component);

    return {
      member: {
        kind,
        ...(
          name
            ? { name }
            : {}
        )
      },
      declarations
    }
  });

  const members = memberResults.map(({ member }) => member);
  const membersDeclarations = memberResults
    .map(({ declarations }) => declarations)
    .reduce(merge, empty());

  const parameterKind = {
    signature,
    members,
    ...(
      internalType
        ? { hints: { internalType } }
        : {}
    ),
    ...(
      identifier
        ? { identifier }
        : {}
    )
  };

  const declarations = merge(
    membersDeclarations,
    from(parameterKind)
  );

  return {
    declarations,
    parameterKind
  };
}
