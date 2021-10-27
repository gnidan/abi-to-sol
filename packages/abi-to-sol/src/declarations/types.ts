import { Identifier } from "./identifier";
import { Bindings, HasBindings, MissingDeepBindings, MissingBindings, Kind } from "./kind";

export type Declarations<B extends Bindings = MissingBindings> = {
  byIdentifierReference: {
    [reference: Identifier.Reference]:
      | Kind.Interface<B>
      | Kind.UserDefinedValueType
      | Kind.Struct<B>
  };
  unnamedBySignature: UnnamedBySignature<B>;
  globalIdentifiers: Set<Identifier.Reference>;
  identifiersByContainer: {
    [reference: Identifier.Interface.Reference]: Set<Identifier.Reference>;
  };
}

export type UnnamedBySignature<B extends Bindings = MissingBindings> =
  B extends HasBindings
  ? {
      [signature: string]: never;
    }
  : B extends MissingDeepBindings
  ? {
      [signature: string]: undefined;
    }
  : B extends MissingBindings
  ? {
      [signature: string]: Kind.Struct<B>; // udvts are inherently named
    }
  : {
      [signature: string]: Kind.Struct<B>; // udvts are inherently named
    };

/**
 * Initialize an empty set of declarations
 */
export const empty = <B extends Bindings>(): Declarations<B> => ({
  byIdentifierReference: {},
  globalIdentifiers: new Set([]),
  identifiersByContainer: {},
  unnamedBySignature: {} as UnnamedBySignature<B>
});

/**
 * Merge two sets of declarations
 */
export const merge = <B extends Bindings>(
  a: Declarations<B>,
  b: Declarations<B>
): Declarations<B> => ({
  byIdentifierReference: {
    ...a.byIdentifierReference,
    ...b.byIdentifierReference
  },
  unnamedBySignature: {
    ...a.unnamedBySignature,
    ...b.unnamedBySignature
  },
  globalIdentifiers: new Set([
    ...a.globalIdentifiers,
    ...b.globalIdentifiers
  ]),
  identifiersByContainer: mergeIdentifiersByContainer(
    a.identifiersByContainer,
    b.identifiersByContainer
  )
});

/**
 * Generate declarations to include a single Kind.
 * Note! This does not recurse; e.g. it returns empty() for arrays always
 */
export const from = <B extends Bindings>(
  kind: Kind<B>
): Declarations<B> => {
  if (Kind.isInterface(kind)) {
    return fromInterface(kind);
  }

  if (Kind.isStruct(kind)) {
    return fromStruct(kind);
  }

  if (Kind.isUserDefinedValueType(kind)) {
    return fromUserDefinedValueType(kind);
  };

  return empty();
}

const fromUserDefinedValueType = <B extends Bindings>(
  kind: Kind.UserDefinedValueType
): Declarations<B> => {
  const { identifier } = kind;
  const reference = Identifier.toReference(identifier);
  const { container } = identifier;

  // globally-defined case
  if (!container) {
    return {
      byIdentifierReference: {
        [reference]: kind
      },
      unnamedBySignature: {} as UnnamedBySignature<B>,
      globalIdentifiers: new Set([reference]),
      identifiersByContainer: {}
    };
  }

  // defined inside containing contract/interface
  const containerDeclarations = fromInterface({ identifier: container });
  const containerReference = Identifier.toReference(container);

  return merge(containerDeclarations, {
    byIdentifierReference: {
      [reference]: kind,
    },
    unnamedBySignature: {} as UnnamedBySignature<B>,
    globalIdentifiers: new Set([]),
    identifiersByContainer: {
      [containerReference]: new Set([reference])
    }
  });
}

const fromStruct = <B extends Bindings>(
  kind: Kind.Struct<B>
): Declarations<B> => {
  const { identifier } = kind;

  // unnamed case
  if (!identifier) {
    const { signature } = kind;

    return {
      byIdentifierReference: {},
      unnamedBySignature: {
        [signature]: kind
      } as UnnamedBySignature<B>,
      globalIdentifiers: new Set([]),
      identifiersByContainer: {},
    };
  }

  const reference = Identifier.toReference(identifier);
  const { container } = identifier;

  // globally-defined case
  if (!container) {
    return {
      byIdentifierReference: {
        [reference]: kind
      },
      unnamedBySignature: {} as UnnamedBySignature<B>,
      globalIdentifiers: new Set([reference]),
      identifiersByContainer: {}
    };
  }

  // defined inside containing contract/interface
  const containerDeclarations = fromInterface({ identifier: container });

  const containerReference = Identifier.toReference(container);

  return merge(containerDeclarations, {
  // defined inside interface case
    byIdentifierReference: {
      [reference]: kind,
    },
    unnamedBySignature: {} as UnnamedBySignature<B>,
    globalIdentifiers: new Set([]),
    identifiersByContainer: {
      [containerReference]: new Set([reference])
    }
  });
}

const fromInterface = <B extends Bindings>(
  kind: Kind.Interface<B>
): Declarations<B> => {
  const { identifier } = kind;
  if (!identifier) {
    return empty();
  }

  const reference = Identifier.toReference(identifier);

  return {
    byIdentifierReference: {
      [reference]: kind,
    },
    unnamedBySignature: {} as UnnamedBySignature<B>,
    globalIdentifiers: new Set([reference]),
    identifiersByContainer: {}
  };
};

const mergeIdentifiersByContainer = <B extends Bindings>(
  a: Declarations<B>["identifiersByContainer"],
  b: Declarations<B>["identifiersByContainer"]
) =>
  ([...new Set([
    ...Object.keys(a),
    ...Object.keys(b)
  ])] as Identifier.Interface.Reference[])
    .map((containerReference: Identifier.Interface.Reference) => ({
      [containerReference]: new Set([
        ...(a[containerReference] || []),
        ...(b[containerReference] || [])
      ])
    }))
    .reduce((a, b) => ({ ...a, ...b }), {})

