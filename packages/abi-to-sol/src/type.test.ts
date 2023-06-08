import { isType } from "./type";

describe("isType", () => {
  it("recognizes dynamic arrays", () => {
    expect(isType("uint256[]")).toEqual(true);
  });

  it("recognizes static arrays", () => {
    expect(isType("uint256[1]")).toEqual(true);
  });

  it("recognizes arrays of arrays", () => {
    expect(isType("ufixed256x18[][]")).toEqual(true);
  });
});
