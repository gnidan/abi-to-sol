import React from "react";

import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/github";

import * as Input from "./Input";

export const Editor = () => {
  const { contents, setContents } = Input.Container.useContainer();

  return (
    <AceEditor
      placeholder=""
      mode="json"
      theme="github"
      name="abi-input-editor"
      height="100%"
      width="100%"
      onChange={setContents}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={contents}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
}
