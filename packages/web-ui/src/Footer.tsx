import React from 'react';
import {
  Box,
  Link,
  Heading,
  Text,
} from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { version } from "abi-to-sol/package.json";

export const Footer = () => {
  return (
    <Box>
      <Heading size="md" paddingTop="10px">
        <strong>abi-to-sol</strong> v{version} <a
          href="http://github.com/gnidan/abi-to-sol"
          title="Github Repository"
        >
          <FaGithub style={{ display: "inline-block" }} />
        </a>
      </Heading>
      <Text>
        Tool &amp; web UI &copy; 2020-2021{" "}
        <Link
          color="purple.500"
          href="https://github.com/gnidan"
        >
          @gnidan
        </Link> and distributed under the MIT license.
      </Text>
      <Text>
        <Link
          color="purple.500"
          href="https://github.com/gnidan/abi-to-sol/issues"
        >
          Having issues with this tool?
        </Link>
      </Text>
    </Box>
  );
}
