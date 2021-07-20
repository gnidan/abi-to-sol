import React from "react";
import { createContainer } from "unstated-next";

import type { GenerateSolidityOptions } from "abi-to-sol";
import { forState } from "../makeSet";

export type State = Pick<
  GenerateSolidityOptions,
  "name" | "solidityVersion" | "license"
> & {
  prettifyOutput: boolean;
};

export function useOptions() {
  const [state, setState] = React.useState<State>({
    prettifyOutput: true,
  });

  const makeSet = forState<State>({ state, setState });

  return {
    ...state,
    setName: makeSet("name", (value) => value === ""),
    setSolidityVersion: makeSet("solidityVersion", (value) => value === ""),
    setLicense: makeSet("license", (value) => value === ""),
    setPrettifyOutput: makeSet("prettifyOutput"),
    setState,
  };
}

export const Container = createContainer(useOptions);
