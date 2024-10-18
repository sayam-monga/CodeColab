"use client";
import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";
export default function TextArea() {
  const [code, setCode] = useState<any>("");

  const editorRef = useRef(null);
  // function handleEditorDidMount(editor: any, monaco: Monaco) {
  //   editorRef.current = editor;
  // }
  function submitHandler() {
    console.log(code);
  }
  useEffect(() => {
    console.log(code);
  }, [code]);
  return (
    <div className="TextArea w-full h-fit">
      <button onClick={submitHandler}>submit</button>
      <Editor
        onChange={(e) => {
          setCode(e);
        }}
        height="100vh"
        width="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        options={{
          wordWrap: "on",
        }}
        // onMount={handleEditorDidMount}
      />
    </div>
  );
}
