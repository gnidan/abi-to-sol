import React from "react";
import { createContainer } from "unstated-next";

import { useToast } from "@chakra-ui/react";

import prettierSolidity from "prettier-plugin-solidity";
import { generateSolidity } from "abi-to-sol";
import * as Options from "./Options";
import * as Abi from "../abi";

// @ts-ignore
const prettier = window.prettier;

export interface GeneratingState {
  isGenerating: true;
}

export interface NoInputState {
  isGenerating: false;
}

export interface SuccessState {
  isGenerating: false;
  contents: string;
}

export interface ErrorState {
  isGenerating: false;
  error: Error;
}

export type State = GeneratingState | NoInputState | SuccessState | ErrorState;

export const useOutput = (defaultContents: string = "") => {
  const toast = useToast();

  const [state, setState] = React.useState<State>({
    isGenerating: true,
  });

  const {
    name,
    license,
    solidityVersion,
    prettifyOutput,
    setPrettifyOutput,
  } = Options.Container.useContainer();

  const abiInput = Abi.Input.Container.useContainer() as Abi.Input.State;

  React.useEffect(() => {
    setState({ isGenerating: true });

    if (abiInput.isReading || !("abi" in abiInput)) {
      console.debug("waiting for input");
      setState({
        isGenerating: false,
      });
      return;
    }

    const { abi } = abiInput;

    try {
      console.info("generating solidity");
      const unformatted = generateSolidity({
        abi,
        name,
        license,
        solidityVersion,
        prettifyOutput: false,
      });

      if (prettifyOutput) {
        try {
          const formatted = prettier.format(unformatted, {
            plugins: [prettierSolidity],
            parser: "solidity-parse",
          });

          setState({
            isGenerating: false,
            contents: formatted,
          });
        } catch {
          setPrettifyOutput(false);

          setState({
            isGenerating: false,
            contents: unformatted,
          });
        }
      } else {
        setState({
          isGenerating: false,
          contents: unformatted,
        });
      }
    } catch (error) {
      setState({
        isGenerating: false,
        error: error as Error,
      });
    }
  }, [
    abiInput,
    license,
    name,
    prettifyOutput,
    solidityVersion,
    setPrettifyOutput,
  ]);

  // const abi = "abi" in abiInput && abiInput.abi;
  const contents = useDebounce(
    "contents" in state ? state.contents : undefined,
    500
  );
  const [previousContents, setPreviousContents] = React.useState<
    string | undefined
  >(undefined);
  React.useEffect(() => {
    if (contents && contents !== previousContents) {
      const toastOptions = {
        title: "Generated Solidity",
        status: "success",
        position: "bottom-right",
        duration: 1000,
      } as const;

      toast(toastOptions);
    }
    setPreviousContents(contents);
  }, [contents, previousContents, toast]);

  return state;
};

export const Container = createContainer(useOutput);

function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
