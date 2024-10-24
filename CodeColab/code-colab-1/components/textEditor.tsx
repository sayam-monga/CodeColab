"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

// Connect to the Socket.io server
const socket = io("http://localhost:3001");

interface TextAreaProps {
  roomId: string | undefined; // Adjust type based on your application's needs
}

const TextArea: React.FC<TextAreaProps> = ({ roomId }) => {
  // Use FC for functional component type
  const [code, setCode] = useState<string>("");

  // Join the room when component mounts
  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId);
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Sync editor code
  const syncCode = (newCode: string) => {
    setCode(newCode);
    if (roomId) {
      socket.emit("code-change", { roomId, code: newCode });
    }
  };

  // Handle incoming code updates from server
  useEffect(() => {
    const handleCodeUpdate = (newCode: string) => {
      setCode(newCode);
    };

    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
    };
  }, []);

  if (!roomId) {
    return <div>Hello </div>; // Render a loading state while waiting for roomId
  }

  return (
    <Editor
      value={code}
      onChange={(value) => {
        if (value) {
          syncCode(value);
        }
      }}
      height="100vh"
      width="100%"
      theme="vs-dark"
      defaultLanguage="javascript"
      options={{
        wordWrap: "on",
      }}
    />
  );
};

export default TextArea;
