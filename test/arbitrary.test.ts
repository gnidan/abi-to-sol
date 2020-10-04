import * as fc from "fast-check";
import {testProp} from "jest-fast-check";
import * as abiSchema from "@truffle/contract-schema/spec/abi.spec.json";
import {matchers} from "jest-json-schema";

expect.extend(matchers);

import * as Arbitrary from "./arbitrary";

const withDefinitions = (schema: object) => ({
  definitions: abiSchema.definitions,
  ...schema,
});

const arbitraries = {
  Type: {
    arbitrary: Arbitrary.Type(),
    schema: abiSchema.definitions.Type,
  },
  Parameter: {
    arbitrary: Arbitrary.Parameter(),
    schema: withDefinitions(abiSchema.definitions.Parameter),
  },
  EventParameter: {
    arbitrary: Arbitrary.EventParameter(),
    schema: withDefinitions(abiSchema.definitions.EventParameter),
  },
  Event: {
    arbitrary: Arbitrary.Event(),
    schema: withDefinitions(abiSchema.definitions.Event),
  },
  NormalFunction: {
    arbitrary: Arbitrary.NormalFunction(),
    schema: withDefinitions(abiSchema.definitions.NormalFunction),
  },
  ConstructorFunction: {
    arbitrary: Arbitrary.ConstructorFunction(),
    schema: withDefinitions(abiSchema.definitions.ConstructorFunction),
  },
  ReceiveFunction: {
    arbitrary: Arbitrary.ReceiveFunction(),
    schema: withDefinitions(abiSchema.definitions.ReceiveFunction),
  },
  FallbackFunction: {
    arbitrary: Arbitrary.FallbackFunction(),
    schema: withDefinitions(abiSchema.definitions.FallbackFunction),
  },
  Abi: {
    arbitrary: Arbitrary.Abi(),
    schema: abiSchema,
  },
};

for (const [name, {arbitrary, schema}] of Object.entries(arbitraries)) {
  describe(`Arbitrary.${name}`, () => {
    testProp("validates schema", [arbitrary], (value) => {
      expect(value).toMatchSchema(schema);
    });
  });
}
