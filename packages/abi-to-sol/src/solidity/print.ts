import { Kind } from "../declarations";

export const printType = (
  kind: Kind,
  options: {
    currentInterfaceName?: string;
    enableUserDefinedValueTypes?: boolean;
    enableGlobalStructs?: boolean;
    shimGlobalInterfaceName?: string;
  } = {}
): string => {
  const {
    currentInterfaceName,
    enableUserDefinedValueTypes = false,
    enableGlobalStructs = false,
    shimGlobalInterfaceName
  } = options;

  if (Kind.isUserDefinedValueType(kind)) {
    return printUserDefinedValueTypeType(kind, {
      currentInterfaceName,
      enableUserDefinedValueTypes
    });
  }

  if (Kind.isElementary(kind)) {
    return printElementaryType(kind);
  }

  if (Kind.isStruct(kind)) {
    return printStructType(kind, {
      currentInterfaceName,
      enableGlobalStructs,
      shimGlobalInterfaceName
    });
  }

  if (Kind.isArray(kind)) {
    return printArrayType(kind, options);
  }

  throw new Error(`Unexpectedly unsupported kind: ${JSON.stringify(kind)}`);
}

const printUserDefinedValueTypeType = (
  kind: Kind.UserDefinedValueType,
  options: {
    currentInterfaceName?: string;
    enableUserDefinedValueTypes?: boolean;
  } = {}
): string => {
  const {
    currentInterfaceName,
    enableUserDefinedValueTypes = false
  } = options;

  const result = (
    kind.identifier.container &&
    kind.identifier.container.name !== currentInterfaceName
  )
    ? `${kind.identifier.container.name}.${kind.identifier.name}`
    : kind.identifier.name;

  if (!enableUserDefinedValueTypes) {
    return [
      `/* warning: missing UDVT support in source Solidity version; `,
      `parameter is \`${result}\`. */ `,
      kind.type
    ].join("");
  }

  return result;
};

const printElementaryType = (
  kind: Kind.Elementary,
  options: {} = {}
): string => {
  if (kind.type !== "function") {
    return kind.type;
  }

  // use just the `internalType` field if it exists
  if (kind.hints?.internalType) {
    return kind.hints.internalType;
  }

  // otherwise output minimally syntactically-valid syntax with a warning
  return [
    "/* warning: the following type may be incomplete. ",
    "the receiving contract may expect additional input or output parameters. */ ",
    "function() external"
  ].join("");
}

const printStructType = (
  kind: Kind.Struct,
  options: {
    currentInterfaceName?: string,
    enableGlobalStructs?: boolean;
    shimGlobalInterfaceName?: string;
  } = {}
): string => {
  const {
    currentInterfaceName,
    enableGlobalStructs = false,
    shimGlobalInterfaceName
  } = options;

  if (!enableGlobalStructs && !shimGlobalInterfaceName) {
    throw new Error(
      "Option `shimGlobalInterfaceName` is required without global structs"
    )
  }

  if (
    kind.identifier.container &&
    kind.identifier.container.name !== currentInterfaceName
  ) {
    return `${kind.identifier.container.name}.${kind.identifier.name}`;
  }

  if (
    !kind.identifier.container &&
    currentInterfaceName &&
    !enableGlobalStructs
  ) {
    return `${shimGlobalInterfaceName}.${kind.identifier.name}`;
  }

  return kind.identifier.name;
}

const printArrayType = (
  kind: Kind.Array,
  options: {
    currentInterfaceName?: string;
    enableUserDefinedValueTypes?: boolean;
    enableGlobalStructs?: boolean;
    shimGlobalInterfaceName?: string;
  } = {}
): string => {
  if (Kind.Array.isDynamic(kind)) {
    return `${printType(kind.itemKind, options)}[]`;
  }

  // static case
  return `${printType(kind.itemKind, options)}[${kind.length}]`;
}

