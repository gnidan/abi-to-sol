import { Identifier } from "./identifier";
import { Kind, Bindings, HasBindings, MissingDeepBindings } from "./kind";

import { Declarations, merge } from "./types";

export const bind = (
  declarations: Declarations<Bindings>
): Declarations<HasBindings> => {
  const {
    newDeclarations,
    identifierBySignature,
  }: {
    newDeclarations: Declarations<MissingDeepBindings>;
    identifierBySignature: {
      [signature: string]: Identifier
    }
  } = Object.entries(declarations.unnamedBySignature || {})
    .map(([signature, unidentifiedKind], index) => {
      const identifier: Identifier = {
        class: "struct",
        name: `S_${index}`
      };

      const kind = {
        ...unidentifiedKind,
        identifier
      };

      return {
        kind,
        signature
      };
    })
    .reduce((
      {
        newDeclarations: {
          byIdentifierReference,
          globalIdentifiers
        },
        identifierBySignature
      },
      {
        kind,
        signature
      }
    ) => ({
      newDeclarations: {
        byIdentifierReference: {
          ...byIdentifierReference,
          [Identifier.toReference(kind.identifier)]: kind
        },
        unnamedBySignature: {},
        globalIdentifiers: new Set([
          ...globalIdentifiers,
          Identifier.toReference(kind.identifier)
        ]),
        identifiersByContainer: {},
      },
      identifierBySignature: {
        ...identifierBySignature,
        [signature]: kind.identifier
      }
    }), {
      newDeclarations: {
        byIdentifierReference: {},
        unnamedBySignature: {},
        globalIdentifiers: new Set<Identifier.Reference>([]),
        identifiersByContainer: {}
      },
      identifierBySignature: {}
    });

  const declarationsMissingDeepBindings = merge(
    declarations as Declarations<MissingDeepBindings>,
    newDeclarations
  );

  return {
    byIdentifierReference: Object.entries(
      declarationsMissingDeepBindings.byIdentifierReference
    )
      .map(([identifierReference, kind]) => ({
        [identifierReference]: Kind.isStruct(kind)
          ? bindStruct(kind, identifierBySignature)
          : kind
      }))
    .reduce((a, b) => ({ ...a, ...b }), {}),
    unnamedBySignature: {},
    globalIdentifiers: declarationsMissingDeepBindings.globalIdentifiers,
    identifiersByContainer: declarationsMissingDeepBindings.identifiersByContainer
  };
};

const bindKind = (
  kind: Kind<Bindings>,
  identifierBySignature: {
    [signature: string]: Identifier;
  }
): Kind<HasBindings> => {
  if (Kind.isElementary(kind)) {
    return kind;
  }

  if (Kind.isUserDefinedValueType(kind)) {
    return kind;
  }

  if (Kind.isStruct(kind)) {
    return bindStruct(kind, identifierBySignature);
  }

  if (Kind.isArray(kind)) {
    return bindArray(kind, identifierBySignature);
  }

  throw new Error("Could not recognize kind");
}

const bindStruct = (
  kind: Kind.Struct<Bindings>,
  identifierBySignature: {
    [signature: string]: Identifier;
  }
): Kind.Struct<HasBindings> => {
  const {
    signature,
    identifier = identifierBySignature[signature]
  } = kind;

  const members = kind.members.map(({ name, kind }) => ({
    name,
    kind: bindKind(kind, identifierBySignature)
  }));

  return {
    signature,
    members,
    identifier
  }
};

const bindArray = (
  kind: Kind.Array<Bindings>,
  identifierBySignature: {
    [signature: string]: Identifier;
  }
): Kind.Array<HasBindings> => {
  const itemKind = bindKind(kind.itemKind, identifierBySignature);
  const length = kind.length;

  return {
    itemKind,
    ...("length" in kind
      ? { length }
      : {}
    )
  };
};
