import React from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription, Box } from "@chakra-ui/react";

import * as Output from "./Output";

// Highlight.js setup
import "highlight.js/styles/default.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);
hljs.initHighlightingOnLoad();


export const Code = () => {
  const { isGenerating, ...result } = Output.Container.useContainer();

  const [html, setHtml] = React.useState("");
  const [showHtml, setShowHtml] = React.useState(false);

  const error = "error" in result && result.error;

  React.useEffect(() => {
    if (isGenerating) {
      setShowHtml(false);
      return;
    }

    if ("contents" in result) {
      const { contents } = result;

      try {
        setHtml(hljs.highlight(contents, { language: "solidity" }).value);
        setShowHtml(true);
      } catch {
        setHtml(contents);
        setShowHtml(true);
      }

      return;
    }

    setShowHtml(false);

  }, [isGenerating, result]);

  return (
    <Box paddingTop="1em">
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Could not generate Solidity!</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    )}
      {showHtml && (
        <pre dangerouslySetInnerHTML={{
          __html: html
        }} />
      )}
    </Box>
  )
}

