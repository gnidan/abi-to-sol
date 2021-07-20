import React from "react";
import { Text, Button, useClipboard } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";

export interface CopyButtonOptions {
  text?: string;
}

export const CopyButton = ({ text }: CopyButtonOptions) => {
  let buttonText = "Copy to clipboard";

  const { hasCopied, onCopy } = useClipboard(text || "");

  if (!text) {
    buttonText = "No result";
  } else if (hasCopied) {
    buttonText = 'Copied'
  }

  return (
    <Button
      width="11.5em"
      disabled={!text}
      justifyContent="left"
      onClick={onCopy}
    >
      <Text>
        <CopyIcon />{" "}{buttonText}
      </Text>
    </Button>
  );
}
