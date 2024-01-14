# Web UI

Try out `abi-to-sol` via a web UI.

## Getting started

### Prerequisites

- Node 16

### Instructions

1. If dependencies aren't already installed, run the following in the **root** of the repo:

```bash
$ yarn
```

2. If `abi-to-sol` hasn't been built, i.e. `packages/abi-to-sol/dist` doesn't exist, run the following in `packages/abi-to-sol`:

```bash
$ yarn prepare
```

## Troubleshooting

### `Error: error:0308010C:digital envelope routines::unsupported`

Switch to Node v16. Explanation of the issue can be found [here](https://stackoverflow.com/a/73027407/6475944).

### `Cannot find module or its corresponding type declarations.` for `abi-to-sol`

`packages/abi-to-sol` hasn't been built. Go to `packages/abi-to-sol` and run `yarn prepare`.
