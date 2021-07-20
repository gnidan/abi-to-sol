import React from "react";
import {
  Box,
  Center,
  Spinner,
  Text
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  QuestionIcon,
  WarningIcon,
} from "@chakra-ui/icons";

import * as Output from "./Output";

export const Status = () => {
  const {
    isGenerating,
    ...result
  } = Output.Container.useContainer();

  let component;
  if (isGenerating) {
    component = (
      <Box>
        Generating{" "}
        <Spinner />
      </Box>
    )
  } else if ("contents" in result) {
    component = (
      <Text>
        Success{" "}
        <CheckCircleIcon color="green.500" />
      </Text>
    );
  } else if ("error" in result) {
    component = (
      <Text>
        Error{" "}
        <WarningIcon color="red.500" />
      </Text>
    );
  } else {
    component = (
      <Text>
        Waiting for input{" "}
        <QuestionIcon color="gray.500" />
      </Text>
    );
  }

  return (
    <Center>
      {component}
    </Center>
  );
}
