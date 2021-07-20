import React from "react";
import { createContainer } from "unstated-next";
import TruffleContractSchema from "@truffle/contract-schema";

import type { GenerateSolidityOptions } from "abi-to-sol";

import { forState } from "../makeSet";

export interface CommonState {
  contents: string;
}

export interface ReadingState {
  isReading: true;
}

export interface SuccessState {
  isReading: false;
  abi: GenerateSolidityOptions["abi"];
}

export interface ErrorState {
  isReading: false;
  error: Error;
}

export type State = CommonState & (ReadingState | SuccessState | ErrorState);

type ReadResult = Pick<SuccessState, "abi"> | Pick<ErrorState, "error">;

export const useInput = (defaultContents: string = "") => {
  const [state, setState] = React.useState<State>({
    contents: defaultContents,
    isReading: true,
  });

  const makeSet = forState<State>({ state, setState });

  const setContents = makeSet("contents");

  React.useEffect(() => {
    // mark isReading
    setState({
      contents: state.contents,
      isReading: true,
    });

    // read
    const result = readContents(state.contents);

    // mark result
    setState(
      "abi" in result
        ? ({
            contents: state.contents,
            isReading: false,
            abi: result.abi,
          } as const)
        : ({
            contents: state.contents,
            isReading: false,
            error: result.error,
          } as const)
    );
  }, [state.contents]);

  return {
    ...state,
    setContents,
  };
};

function readContents(contents: string): ReadResult {
  try {
    const abi = JSON.parse(contents);

    try {
      TruffleContractSchema.validate({ abi });
    } catch (error) {
      console.error(error);
      throw error;
    }

    return { abi };
  } catch (error) {
    return { error };
  }
}

export const Container = createContainer(useInput);
