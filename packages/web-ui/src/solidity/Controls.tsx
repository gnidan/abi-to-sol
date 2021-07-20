import React from "react";
import {
  Box,
  HStack,
  Stack,
  FormLabel,
  Center,
  Spacer,
  Input,
  Switch,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";

import * as Output from "./Output";
import * as Options from "./Options";
import { CopyButton } from "../CopyButton";

export const Controls = () => {
  const { isGenerating, ...result } = Output.Container.useContainer();
  const {
    license,
    prettifyOutput,
    setLicense,
    setPrettifyOutput
  } = Options.Container.useContainer();

  return (
    <HStack
      paddingTop="1em"
      paddingBottom="1em"
      alignItems="flex-start"
    >
      <Stack height="100%" flex="1" justifyContent="space-between">
        <FormLabel htmlFor="license">License</FormLabel>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<LockIcon color="gray.300" />}
          />
          <Input
            id="license"
            type="text"
            placeholder="UNLICENSED"
            value={license || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setLicense(event.target.value)
            }}
          />
        </InputGroup>
      </Stack>
      <Stack>
        <FormLabel htmlFor="format">Prettify output?</FormLabel>
        <Center height="40px">
          <Switch
            id="format"
            isChecked={prettifyOutput}
            onChange={() => {
              setPrettifyOutput(!prettifyOutput);
            }}
          />
        </Center>
      </Stack>
      <Spacer />
      <Stack>
        <Box paddingRight="3px">
          <CopyButton
            text={
              "contents" in result
                ? result.contents
                : ""
            }
          />
        </Box>
      </Stack>
    </HStack>
  );
}
