import type * as Abi from "@truffle/abi-utils";
import { abiTupleSignature } from "@truffle/abi-utils";

import { Identifier } from "./identifier";

import { fromParameter } from "./fromParameter";

describe("fromParameter", () => {
  it("builds declarations from a single elementary type", () => {
    const parameter: Abi.Parameter = {
      type: "uint256",
      name: "u",
      internalType: "uint256"
    };

    const { declarations, parameterKind } = fromParameter(parameter);

    expect(declarations.byIdentifierReference).toEqual({});
    expect(declarations.unnamedBySignature).toEqual({});
  });

  it("builds a reference to an unnamed struct", () => {
    const parameter: Abi.Parameter = {
      type: "tuple",
      name: "s",
      components: [
        {
          type: "uint256",
          name: "u"
        }
      ]
    };

    const expectedSignature = abiTupleSignature(
      // default to satisfy type-checker (Abi.Parameter includes non-tuples)
      parameter.components || []
    );

    const { declarations, parameterKind } = fromParameter(parameter);

    expect(declarations.byIdentifierReference).toEqual({});
    expect(declarations.unnamedBySignature).toHaveProperty("(uint256)");

    const unnamedDeclaration = declarations.unnamedBySignature["(uint256)"];
    if (!unnamedDeclaration) {
      throw new Error("Expected unnamed reference");
    }

    expect(unnamedDeclaration.signature).toEqual(expectedSignature);
    expect(unnamedDeclaration.identifier).toEqual(undefined);
    expect(unnamedDeclaration.members).toHaveLength(1);

    const [member] = unnamedDeclaration.members;

    expect(member.name).toEqual("u");
    expect(member.kind).toEqual({
      type: "uint256"
    });
  });

  it("should deduplicate unnamed structs", () => {
    const internalComponent = {
      name: "u",
      type: "uint256"
    };

    const parameter = {
      name: "a",
      type: "tuple",
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

    // outer struct
    expect(declarations.unnamedBySignature).toHaveProperty("((uint256),(uint256))");
    const outerStruct = declarations.unnamedBySignature["((uint256),(uint256))"];

    // inner struct
    expect(declarations.unnamedBySignature).toHaveProperty("(uint256)");
  });

  it("should include identifiers when given internalType", () => {
    const parameter: Abi.Parameter = {
      name: "a",
      type: "tuple",
      internalType: "struct A",
      components: [{
        name: "u",
        type: "uint256"
      }, {
        name: "f",
        type: "address",
        internalType: "contract Foo"
      }]
    };

    const { declarations, parameterKind } = fromParameter(parameter);

    if (!("identifier" in parameterKind)) {
      throw new Error("Expected `identifier` to exist on parameterKind");
    }

    const { identifier } = parameterKind;

    if (!identifier) {
      throw new Error("Expected identifier to be defined");
    }

    expect(declarations.byIdentifierReference).toHaveProperty(
      Identifier.toReference(identifier)
    );

    const kind = declarations.byIdentifierReference[
      Identifier.toReference(identifier)
    ];

    expect(parameterKind).toEqual(kind);
  });
});

