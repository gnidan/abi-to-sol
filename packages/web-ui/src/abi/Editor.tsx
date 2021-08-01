import React from "react";
import { Box } from "@chakra-ui/react";

import SimpleEditor from "react-simple-code-editor";

// Highlight.js setup
import "highlight.js/styles/default.css";
import hljs from "highlight.js";

import * as Input from "./Input";

export const Editor = () => {
  const { contents, setContents } = Input.Container.useContainer();

  return (
    <Box
      padding="16px 0px"
      height="100%"
    >
      <SimpleEditor
        value={contents}
        onValueChange={setContents}
        highlight={(contents: string) => hljs.highlight(contents, { language: "json" }).value}
        style={{
          fontFamily: "SFMono-Regular,Menlo,Monaco,Consolas,monospace"

        }}
      />
    </Box>
  );
}
