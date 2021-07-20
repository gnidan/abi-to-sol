import React from "react";
import {
  Box,
  Center,
  Spinner,
  Text
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";

import * as Input from "./Input";

export const Status = () => {
  const {
    isReading,
    contents: _contents,
    ...result
  } = Input.Container.useContainer();

  let component;
  if (isReading) {
    component = (
      <Box>
        Reading ABI{" "}
        <Spinner />
      </Box>
    )
  } else if ("abi" in result) {
    component = (
      <Text>
        Valid{" "}
        <CheckCircleIcon color="green.500" />
      </Text>
    );
  } else {
    component = (
      <Text>
        Invalid (maybe copy/paste again?){" "}
        <WarningIcon color="red.500" />
      </Text>
    );
  }

  return (
    <Center>
      {component}
    </Center>
  );
}
