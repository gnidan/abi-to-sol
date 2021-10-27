import * as fc from "fast-check";
import { testProp } from "jest-fast-check";
import { Arbitrary } from "@truffle/abi-utils";

import { Declarations } from ".";
import { Kind } from "./kind";
import { Identifier } from "./identifier";

describe("Declarations.collect", () => {
  describe("arbitrary examples", () => {
    describe("for non-tuple parameters / event parameters", () => {
      testProp(
        "are empty",
        [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
        (parameter) => {
          fc.pre(!parameter.type.startsWith("tuple"));

          expect(Declarations.collect(parameter)).toEqual({
            byIdentifierReference: {},
            unnamedBySignature: {},
            globalIdentifiers: new Set([]),
            identifiersByContainer: {},
          });
        }
      );
    });

    describe("for tuple parameters with non-tuple components", () => {
      testProp(
        "have length 1",
        [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
        (parameter) => {
          fc.pre(parameter.type.startsWith("tuple"));
          fc.pre(
            parameter.components.every(
              (component: any) => !component.type.startsWith("tuple")
            )
          );

          const declarations = Declarations.collect(parameter);
          expect(Object.keys(declarations.byIdentifierReference)).toHaveLength(1);

          const [kind] = Object.values(declarations.byIdentifierReference);
          if (!("members" in kind)) {
            throw new Error("Expected kind to be a struct with members");
          }

          const { members } = kind;
          expect(members).toHaveLength(parameter.components.length);

          for (const [index, member] of members.entries()) {
            expect(member.name).toEqual(parameter.components[index].name);
          }
        }
      );
    });

    describe("for tuple parameters with exactly one tuple component", () => {
      testProp(
        "have length 2",
        [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
        (parameter) => {
          fc.pre(parameter.type.startsWith("tuple"));

          // find exactly one tuple-based component
          const tupleComponents = parameter.components.filter(
            (component: any) => component.type.startsWith("tuple")
          );

          fc.pre(tupleComponents.length === 1);

          const [tupleComponent] = tupleComponents;

          fc.pre(
            tupleComponent.components.every(
              (component: any) => !component.type.startsWith("tuple")
            )
          );

          const declarations = Declarations.collect(parameter);
          expect(Object.keys(declarations.byIdentifierReference)).toHaveLength(2);
        }
      );
    });

    testProp(
      "produce only valid references to each other",
      [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
      (parameter) => {
        fc.pre(parameter.type.startsWith("tuple"));

        const components = parameter.components || [];

        const declarations = Declarations.collect(parameter);

        for (const kind of Object.values(declarations.byIdentifierReference)) {
          if ("members" in kind) {
            for (const member of kind.members) {
              if (Kind.isStruct(member.kind)) {
                if (!("identifier" in member.kind)) {
                  throw new Error("Expected identifier");
                }
                expect(declarations.byIdentifierReference).toHaveProperty(
                  Identifier.toReference(member.kind.identifier)
                );
              }
            }
          }
        }
      }
    );
  });
});
