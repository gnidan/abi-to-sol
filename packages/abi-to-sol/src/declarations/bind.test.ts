import * as Abi from "@truffle/abi-utils";

import { Identifier } from "./identifier";
import { fromParameter } from "./fromParameter";

import { bind } from "./bind";

describe("bind", () => {
  it("should re-use the same identifier for the same unnamed struct", () => {
    const internalComponent = {
      name: "u",
      type: "uint256"
    };

    const parameter = {
      name: "a",
      type: "tuple",
      internalType: "struct A",
      components: [{
        name: "b1",
        type: "tuple",
        components: [{ ...internalComponent }]
      }, {
        name: "b2",
        type: "tuple",
        components: [{ ...internalComponent }]
      }]
    };

    const { declarations, parameterKind } = fromParameter(parameter);
    if (!("identifier" in parameterKind) || !parameterKind.identifier) {
      throw new Error("Expected parameterKind to have identifier");
    }

    const { identifier } = parameterKind;

    const declarationsWithBindings = bind(declarations);

    const outerStructKind = declarationsWithBindings.byIdentifierReference[
      Identifier.toReference(identifier)
    ];

    if (!("members" in outerStructKind)) {
      throw new Error("Expected outer struct to have `members`");
    }

    const { members: [b1, b2] } = outerStructKind;

    if (!("identifier" in b1.kind) || !("identifier" in b2.kind)) {
      throw new Error("Inner struct is missing identifier");
    }

    expect(b1.kind.identifier).toEqual(b2.kind.identifier);
  });
});
