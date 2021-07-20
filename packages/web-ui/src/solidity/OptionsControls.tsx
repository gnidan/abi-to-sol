import React from "react";
import {
  Stack,
  HStack,
  FormLabel,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import * as Options from "./Options";
import * as Examples from "../abi/Examples";
import { examples } from "../abi/Examples";


export const OptionsControls = () => {
  const {
    name,
    setName,
    setSolidityVersion,
    ...options
  } = Options.Container.useContainer();

  const {
    selectedExample,
    selectExample
  } = Examples.Container.useContainer();

  console.debug("name %s", name);

  return (
    <HStack paddingTop="1em" paddingBottom="1em" alignItems="flex-start">
      <Stack height="100%" flex="1" justifyContent="space-between">
        <FormLabel htmlFor="name">Interface name</FormLabel>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<InfoIcon color="gray.300" />}
          />
          <Input
            id="name"
            type="text"
            placeholder="MyInterface"
            value={name || ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              console.debug("changing name via form");
              setName(event.target.value);
            }}
          />
        </InputGroup>
      </Stack>
      <Stack height="100%" flex="1" justifyContent="space-between">
        <FormLabel htmlFor="version">Solidity version</FormLabel>
        <Select
          id="version"
          value={options.solidityVersion || ""}
          placeholder="Choose version"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            setSolidityVersion(event.target.value)
          }}
        >
          <option value="^0.8.0">^0.8.0</option>
          <option value="^0.7.0">^0.7.0</option>
          <option value="^0.6.0">^0.6.0</option>
          <option value="^0.5.0">^0.5.0</option>
          <option value="^0.4.24">^0.4.24</option>
        </Select>
      </Stack>
      <Stack height="100%" flex="1" justifyContent="space-between">
        <FormLabel htmlFor="example">See example</FormLabel>
        <Select
          id="example"
          variant="filled"
          value={selectedExample || ""}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            selectExample(event.target.value)
          }}
          placeholder="Choose example"
        >
          {Object.entries(examples).map(([exampleName, { name }], index) => (
            <option key={index} value={exampleName}>{name}</option>
          ))}
        </Select>
      </Stack>
    </HStack>
  );
}
