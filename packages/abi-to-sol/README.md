# abi-to-sol

[![npm version](https://badge.fury.io/js/abi-to-sol.svg)](https://www.npmjs.com/package/abi-to-sol)
[![gitpoap badge](https://public-api.gitpoap.io/v1/repo/gnidan/abi-to-sol/badge)](https://www.gitpoap.io/gh/gnidan/abi-to-sol)

Input an ABI JSON and get a Solidity `interface` compatible with whatever
`pragma solidity <version-range>` you need.

**abi-to-sol** evaluates your input ABI and finds all the external functions,
events, structs, and user-defined value types in order to produce a source file
that's suitable for copying and pasting into your project. Import your external
contract's interface and interact with it, almost as if you had copied the whole
other project's sourcecode into a "vendor" directory (but without the potential
Solidity version mismatch!)

It doesn't matter what version of Solidity generated the ABI in the first place
(or if the contract wasn't even written in Solidity), **abi-to-sol** will give
you `*.sol` output that's compatible with your existing project! (Some rare
caveats may apply, see [below](#caveats).)

## Try online!

Skip the terminal and just use the hosted
[Web UI](https://gnidan.github.io/abi-to-sol).

## CLI instructions

Install globally via:

```console
$ npm install -g abi-to-sol
```

Installing locally should work fine as well, but you may have to jump through
hoops to get the `abi-to-sol` script available on your PATH.

### Usage

Pipe ABI JSON to stdin, get Solidity on stdout.

```console
abi-to-sol [--solidity-version=<solidityVersion>] [--license=<license>] [--validate] [<name>]
abi-to-sol -h | --help
abi-to-sol --version
```

Options:

```console
<name>
  Name of generated interface. Default: MyInterface

--validate
  Validate JSON before starting

-V --solidity-version
  Version of Solidity (for pragma). Default: >=0.7.0 <0.9.0

-L --license
  SPDX license identifier. default: UNLICENSED

-h --help     Show this screen.
--version     Show version.
```

### Example

Run the following command:

```console
$ echo '[{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"resolver","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"label","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setSubnodeOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"ttl","outputs":[{"name":"","type":"uint64"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"resolver","type":"address"}],"name":"NewResolver","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"ttl","type":"uint64"}],"name":"NewTTL","type":"event"}]' \
  | npx abi-to-sol ENS
```

Get this output:

```solidity
// SPDX-License-Identifier: UNLICENSED
// !! THIS FILE WAS AUTOGENERATED BY abi-to-sol. SEE BELOW FOR SOURCE. !!
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

interface ENS {
  function resolver(bytes32 node) external view returns (address);

  function owner(bytes32 node) external view returns (address);

  function setSubnodeOwner(
    bytes32 node,
    bytes32 label,
    address owner
  ) external;

  function setTTL(bytes32 node, uint64 ttl) external;

  function ttl(bytes32 node) external view returns (uint64);

  function setResolver(bytes32 node, address resolver) external;

  function setOwner(bytes32 node, address owner) external;

  event Transfer(bytes32 indexed node, address owner);
  event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
  event NewResolver(bytes32 indexed node, address resolver);
  event NewTTL(bytes32 indexed node, uint64 ttl);
}

// THIS FILE WAS AUTOGENERATED FROM THE FOLLOWING ABI JSON:
/* ... */

```

## Caveats

- This tool works best with ABIs from contracts written in Solidity, thanks to
  the useful `internalType` hints that Solidity provides. This is non-standard,
  so abi-to-sol still works without those. You should be able to use this tool
  to import someone else's Vyper contract interface into your Solidity project.

- [User-defined value types](https://blog.soliditylang.org/2021/09/27/user-defined-value-types/)
  are supported, but if these UDVTs require special constructors, abi-to-sol
  won't give you any implementations. Take extra care to make sure you know how
  to interact with an external contract that has UDVTs as part of its interface.

- You might run into problems if you need this tool to output interfaces that
  are compatible with sufficiently old versions of Solidity (`<0.5.0`), due to
  certain missing features (structs/arrays couldn't be external function
  parameters back then).

  ... but probably you should definitely _just don't use solc that old._

- Similarly, there might be problems if you need this tool to output interfaces
  that are compatible with a particularly large range of solc versions (e.g.
  `^0.6.0 || ^0.7.0`). This is because the data location changed across versions
  (from `address[] calldata` to `address[] memory`, e.g.), and there's no single
  syntax that abi-to-sol can output that would satisfy everything. (This only
  matters for input ABIs where it's relevant, so you may still be alright.)

- This project does not output Vyper code... but you don't need a project like
  this one for Vyper because Vyper already lets you import `*.abi.json` files
  directly! Maybe this isn't a caveat.

## Is this project useful to you?

Feel free to donate to
[gnidan.eth](https://etherscan.io/address/0xefef50ebacd8da3c13932ac204361b704eb8292c)
❤️
