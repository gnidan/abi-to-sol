import React from "react";
import { createContainer } from "unstated-next";

import * as Input from "./Input";
import { Options } from "../solidity";
import ENS from "./examples/ENS.abi.json";
import DepositContract from "./examples/DepositContract.abi.json";
import UniswapV2RouterO2 from "./examples/UniswapV2Router02.abi.json";
import AirSwap from "./examples/AirSwap.abi.json";

export interface Example {
  name: string;
  license: string;
  contents: string;
}

export const examples: { [exampleName: string]: Example } = {
  ens: {
    name: "ENS",
    license: "BSD-2-Clause",
    contents: JSON.stringify(ENS, undefined, 2),
  },
  eth2: {
    name: "Eth2Deposit",
    license: "CC0-1.0",
    contents: JSON.stringify(DepositContract, undefined, 2)
  },
  uniswap: {
    name: "UniswapV2Router02",
    license: "GPL-3.0",
    contents: JSON.stringify(UniswapV2RouterO2, undefined, 2),
  },
  airswap: {
    name: "AirSwap",
    license: "Apache-2.0",
    contents: JSON.stringify(AirSwap, undefined, 2)
  }
};

export type State = string | undefined;

export const useExample = () => {
  const [state, setState] = React.useState<State>();
  const [locked, setLocked] = React.useState<boolean>(false);
  const input = Input.Container.useContainer();
  const options = Options.Container.useContainer();

  const selectExample = (exampleName: string) => {
    if (exampleName === "") {
      setState(undefined);
      return;
    }

    const example = examples[exampleName];

    if (!example) {
      throw new Error(`Unknown example: "${exampleName}"`);
    }

    setLocked(true);

    const { name, license, contents } = example;
    const { prettifyOutput, solidityVersion, setState: setOptions } = options;
    const { setContents } = input;

    console.debug("setting example %o", example);
    setState(exampleName);
    setOptions({
      name: name,
      license: license,
      solidityVersion,
      prettifyOutput,
    });
    setContents(contents);

    setLocked(false);
  };

  React.useEffect(() => {
    if (locked) {
      console.debug("locked");
      return;
    }

    if (!state) {
      return;
    }

    console.debug("state %o", state);
    const { name, license, contents } = examples[state];
    const nameDiffers = name !== options.name;
    const licenseDiffers = license !== options.license;
    const contentsDiffer = contents !== input.contents;

    if (nameDiffers) {
      console.debug("name differs");
    }
    if (licenseDiffers) {
      console.debug("license differs");
    }
    if (contentsDiffer) {
      console.debug("contentsDiffer");
    }

    if (nameDiffers || licenseDiffers || contentsDiffer) {
      setState(undefined);
    }
  }, [locked, state, input.contents, options.name, options.license]);

  return { selectedExample: state, selectExample };
};

export const Container = createContainer(useExample);
