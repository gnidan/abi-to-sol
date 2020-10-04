import * as fc from "fast-check";
import * as Arbitrary from "../test/arbitrary";

const inspect = <T>(arb: fc.Arbitrary<T>) =>
  fc.sample(arb, 1).map((value) => JSON.stringify(value, null, 2));

console.log(inspect(Arbitrary.Abi())[0]);
