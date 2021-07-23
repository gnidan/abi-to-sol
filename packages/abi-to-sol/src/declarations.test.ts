import * as fc from "fast-check";
import {testProp} from "jest-fast-check";
import {Arbitrary} from "@truffle/abi-utils";
import * as Example from "../test/custom-example";

import {collectDeclarations} from "./declarations";

describe("collectDeclarations", () => {
  describe("arbitrary examples", () => {
    describe("for non-tuple parameters / event parameters", () => {
      testProp(
        "are empty",
        [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
        (parameter) => {
          fc.pre(!parameter.type.startsWith("tuple"));

          expect(collectDeclarations(parameter)).toEqual({});
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

          const declarations = collectDeclarations(parameter);
          expect(Object.keys(declarations)).toHaveLength(1);

          const [declaration] = Object.values(declarations);
          expect(declaration).toHaveProperty("components");

          const {components} = declaration;
          expect(components).toHaveLength(parameter.components.length);

          for (const [index, component] of components.entries()) {
            expect(component.name).toEqual(parameter.components[index].name);
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

          const declarations = collectDeclarations(parameter);
          expect(Object.keys(declarations)).toHaveLength(2);
        }
      );
    });

    testProp(
      "produce only valid references to each other",
      [fc.oneof(Arbitrary.Parameter(), Arbitrary.EventParameter())],
      (parameter) => {
        fc.pre(parameter.type.startsWith("tuple"));

        const components = parameter.components || [];

        const declarations = collectDeclarations(parameter);

        for (const {components} of Object.values(declarations)) {
          for (const {signature} of components) {
            if (signature) {
              expect(declarations).toHaveProperty(signature);
            }
          }
        }
      }
    );
  });

  describe("custom example", () => {
    const declarations = collectDeclarations(Example.abi);

    for (const [structName, signature] of Object.entries(
      Example.expectedSignatures
    )) {
      describe(`struct ${structName}`, () => {
        it("exists in declarations", () => {
          expect(declarations).toHaveProperty(signature);
        });

        const expectedComponents = (Example.expectedDeclarations as any)[
          structName
        ];
        const declaration = declarations[signature];

        for (const [componentName, component] of Object.entries(
          expectedComponents
        )) {
          describe(`component ${componentName}`, () => {
            it("exists in declarations", () => {
              const names = declaration.components.map(({name}) => name);
              expect(names).toContain(componentName);
            });

            const expectedComponent = (expectedComponents as any)[
              componentName
            ];

            const component: any = declaration.components.find(
              ({name}) => name === componentName
            );

            it("has correct type", () => {
              expect(component.type).toEqual(expectedComponent.type);
            });

            if (component.signature) {
              it("has correct signature", () => {
                expect(component.signature).toEqual(
                  expectedComponent.signature
                );
              });
            }
          });
        }
      });
    }
  });
});
