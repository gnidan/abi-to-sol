import {Abi as SchemaAbi} from "@truffle/contract-schema/spec";

/**
 * Solidity used to generate this ABI:
 *
 * ```solidity
 * // SPDX-License-Identifier: UNLICENSED
 * pragma solidity ^0.7.0;
 * pragma experimental ABIEncoderV2;
 *
 * struct Bar {
 *     uint256 a;
 *     uint256 b;
 * }
 *
 * struct Foo {
 *     Bar[] bars;
 *     uint256 c;
 * }
 *
 * contract TestCase {
 *     event Event (Bar[] indexed);
 *
 *     constructor (Foo memory foo1, Foo memory foo2, Bar memory bar) {
 *     }
 * }
 * ```
 */
export const abi: SchemaAbi = [
  {
    inputs: [
      {
        components: [
          {
            components: [
              {internalType: "uint256", name: "a", type: "uint256"},
              {internalType: "uint256", name: "b", type: "uint256"},
            ],
            internalType: "struct Bar[]",
            name: "bars",
            type: "tuple[]",
          },
          {internalType: "uint256", name: "c", type: "uint256"},
        ],
        internalType: "struct Foo",
        name: "foo1",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              {internalType: "uint256", name: "a", type: "uint256"},
              {internalType: "uint256", name: "b", type: "uint256"},
            ],
            internalType: "struct Bar[]",
            name: "bars",
            type: "tuple[]",
          },
          {internalType: "uint256", name: "c", type: "uint256"},
        ],
        internalType: "struct Foo",
        name: "foo2",
        type: "tuple",
      },
      {
        components: [
          {internalType: "uint256", name: "a", type: "uint256"},
          {internalType: "uint256", name: "b", type: "uint256"},
        ],
        internalType: "struct Bar",
        name: "bar",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {internalType: "uint256", name: "a", type: "uint256"},
          {internalType: "uint256", name: "b", type: "uint256"},
        ],
        indexed: true,
        internalType: "struct Bar[]",
        name: "",
        type: "tuple[]",
      },
    ],
    name: "Event",
    type: "event",
  },
];

export const expectedSignatures: {[name: string]: string} = {
  Foo: "((uint256,uint256)[],uint256)",
  Bar: "(uint256,uint256)",
};
