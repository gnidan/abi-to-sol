import React from "react";
import{
  Box,
  Flex,
  PropsOf,
} from "@chakra-ui/react";

export const Page: React.FC<PropsOf<typeof Flex>> = ({
  children,
  ...props
}) => {
  return (
    <Flex flexWrap="wrap" {...props}>
      {children}
    </Flex>
  )
}


export const Container: React.FC<PropsOf<typeof Box>> = ({
  children,
  ...props
}) => {
  return (
    <Box
      flex="0 1 auto"
      width="50%"
      padding="0 10px"
      {...props}
    >
      {children}
    </Box>
  );
}
