import React from "react";

import {
  Box,
  HStack,
  Spacer,
  Heading,
} from "@chakra-ui/react";

import { Status } from "./Status";

export const Header = () => {
  return (
    <HStack>
      <Heading>ABI</Heading>
      <Spacer />
      <Box>
        <Status />
      </Box>
    </HStack>
  );
}
