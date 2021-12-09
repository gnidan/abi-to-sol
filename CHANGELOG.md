# abi-to-sol changelog

## vNext

### Dependency updates

- Update dependency: typescript@4.5.2
  ([#43](https://github.com/gnidan/abi-to-sol/pull/43) by
  [@gnidan](https://github.com/gnidan))

- Update dependency: better-ajv-errors@^0.8.2
  ([#43](https://github.com/gnidan/abi-to-sol/pull/44) by
  [@gnidan](https://github.com/gnidan))

- Bump tar from 4.4.13 to 4.4.19
  ([#45](https://github.com/gnidan/abi-to-sol/pull/45) by
  [@dependabot](https://github.com/dependabot))

- Bump tmpl from 1.0.4 to 1.0.5
  ([#46](https://github.com/gnidan/abi-to-sol/pull/46) by
  [@dependabot](https://github.com/dependabot))

- Bump url-parse from 1.5.1 to 1.5.3
  ([#47](https://github.com/gnidan/abi-to-sol/pull/47) by
  [@dependabot](https://github.com/dependabot))

## v0.5.1

### Internal improvements

- Add script for upgrading dependencies
  ([#37](https://github.com/gnidan/abi-to-sol/pull/37) by
  [@gnidan](https://github.com/gnidan))

- Upgrade typescript to ^4.4.4
  ([#38](https://github.com/gnidan/abi-to-sol/pull/38) by
  [@gnidan](https://github.com/gnidan))

## v0.5.0

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.5.0).

### New features

- Support custom ABI errors ([#33](https://github.com/gnidan/abi-to-sol/pull/33)
  by [@gnidan](https://github.com/gnidan))

### Fixes

- Properly error when generating structs on unsupported Solidity versions
  ([#32](https://github.com/gnidan/abi-to-sol/pull/32) by
  [@gnidan](https://github.com/gnidan))
- Fix version-feature checks to succeed only when entire range has feature
  ([#35](https://github.com/gnidan/abi-to-sol/pull/35) by
  [@gnidan](https://github.com/gnidan))

### Internal improvements

- Enforce CHANGELOG entries in pull requests
  ([#30](https://github.com/gnidan/abi-to-sol/pull/30) by
  [@gnidan](https://github.com/gnidan))

### Dependency updates

- Update dependency: @truffle/abi-utils@^0.2.2
  ([#29](https://github.com/gnidan/abi-to-sol/pull/29) by
  [@gnidan](https://github.com/gnidan))

### web-ui changes

- Switch to react-simple-code-editor
  ([#31](https://github.com/gnidan/abi-to-sol/pull/31) by
  [@gnidan](https://github.com/gnidan))

## v0.4.0

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.4.0).

### New features

- Error upon Solidity version syntax ambiguity
  ([#21](https://github.com/gnidan/abi-to-sol/pull/21) by
  [@gnidan](https://github.com/gnidan))

### Enhancements

- Include package version in autogen notice
  ([#25](https://github.com/gnidan/abi-to-sol/pull/25) by
  [@gnidan](https://github.com/gnidan))
- Only emit `pragma experimental ABIEncoderV2` when necessary
  ([#22](https://github.com/gnidan/abi-to-sol/pull/22) by
  [@gnidan](https://github.com/gnidan))

### Bug fixes

- Put structs in the right places
  ([#24](https://github.com/gnidan/abi-to-sol/pull/24) by
  [@gnidan](https://github.com/gnidan))

### Housekeeping

- Note lack of support for ABI errors
  ([#26](https://github.com/gnidan/abi-to-sol/pull/26) by
  [@gnidan](https://github.com/gnidan))
- Change default version to >=0.7.0 <0.9.0
  ([#20](https://github.com/gnidan/abi-to-sol/pull/20) by
  [@gnidan](https://github.com/gnidan))

### Internal improvements

- Refactor things a bit ([#23](https://github.com/gnidan/abi-to-sol/pull/23) by
  [@gnidan](https://github.com/gnidan))

### web-ui changes

- Show errors from generateSolidity
  ([#19](https://github.com/gnidan/abi-to-sol/pull/19) by
  [@gnidan](https://github.com/gnidan))

## v0.3.0

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.3.0).

### New features

- Export GenerateSolidityOptions interface type
  ([#13](https://github.com/gnidan/abi-to-sol/pull/13) by @gnidan)
- Allow disabling prettier ([#14](https://github.com/gnidan/abi-to-sol/pull/14)
  by [@gnidan])
- Add web UI ([#16](https://github.com/gnidan/abi-to-sol/pull/16) by [@gnidan])
- Begin to differ output based on Solidity version / features used by ABI
  ([#17](https://github.com/gnidan/abi-to-sol/pull/17) by [@gnidan])

### Bug fixes

- Replace invalid characters in internalTypes
  ([#15](https://github.com/gnidan/abi-to-sol/pull/15) by [@gnidan])

## v0.2.1

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.2.1).

### Dependency updates

- Remove unused @drizzle/store dependency
  ([#12](https://github.com/gnidan/abi-to-sol/pull/12) by
  [@gnidan](https://github.com/gnidan))

## v0.2.0

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.2.0).

### Dependency updates

- Switch to using @truffle/abi-utils
  ([#11](https://github.com/gnidan/abi-to-sol/pull/11) by
  [@gnidan](https://github.com/gnidan))

## v0.1.6

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.1.6).

### Enhancements

- Support anonymous events ([#7](https://github.com/gnidan/abi-to-sol/pull/7) by
  [@gnidan](https://github.com/gnidan))

### Dependency updates

- Upgrade prettier-plugin-solidity to v1.0.0-alpha.59
  ([#6](https://github.com/gnidan/abi-to-sol/pull/6) by
  [@gnidan](https://github.com/gnidan))

### Internal improvements

- Fix incorrect type string ([#5](https://github.com/gnidan/abi-to-sol/pull/5)
  by [@gnidan](https://github.com/gnidan))

## v0.1.5

See [release notes](https://github.com/gnidan/abi-to-sol/releases/tag/v0.1.5).

### Enhancements

- Broaden default Solidity version to `>=0.5.0 <0.8.0` (and centralize
  defaulting logic) ([#1](https://github.com/gnidan/abi-to-sol/pull/1) by
  [@gnidan](https://github.com/gnidan))
- Add runtime source map support
  ([#4](https://github.com/gnidan/abi-to-sol/pull/4) by
  [@gnidan](https://github.com/gnidan))

### Internal improvements

- Add a Gitter chat badge to README.md
  ([#3](https://github.com/gnidan/abi-to-sol/pull/3) by
  [@gitter-badger](https://github.com/gitter-badger))
- Fix invalid package.json script
  ([#2](https://github.com/gnidan/abi-to-sol/pull/2) by
  [@gnidan](https://github.com/gnidan))
