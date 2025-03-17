"use client";
import React, { useEffect, useState, useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import * as monacoEditor from "monaco-editor";
import { useSearchParams } from "next/navigation";

// Connect to the Socket.io server
const SOCKET_URL = "http://localhost:3001";

interface User {
  id: string;
  name: string;
  joinedAt: Date;
}

interface TextAreaProps {
  roomId: string;
  value?: string;
  onChange?: (value: string) => void;
  onUsersUpdate?: (users: User[]) => void;
  socket?: Socket | null;
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: {
    lineNumber: number;
    column: number;
  };
}

const TextArea: React.FC<TextAreaProps> = ({
  roomId,
  value,
  onChange,
  onUsersUpdate,
  socket: externalSocket,
}) => {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name") || "Anonymous";
  const [code, setCode] = useState<string>(value || "");
  const [connected, setConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const isUpdatingRef = useRef(false);

  // Use external socket if provided, otherwise create our own
  useEffect(() => {
    if (externalSocket) {
      socketRef.current = externalSocket;
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      // Join the room after connection
      socket.emit("join-room", { roomId, userName });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userName, externalSocket]);

  // Handle socket events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    // Handle initial code when joining room
    socket.on("initial-code", (initialCode: string) => {
      console.log("Received initial code:", initialCode);
      if (initialCode && !code) {
        isUpdatingRef.current = true;
        setCode(initialCode);
        if (onChange) onChange(initialCode);
        isUpdatingRef.current = false;
      }
    });

    // Handle code updates from other users
    socket.on("code-update", (newCode: string) => {
      console.log("Received code update:", newCode);
      isUpdatingRef.current = true;
      setCode(newCode);
      if (onChange) onChange(newCode);
      isUpdatingRef.current = false;
    });

    // Handle user join/leave events
    socket.on("user-joined", ({ userCount: count, userName }) => {
      setUserCount(count);
      console.log(`${userName} joined the room`);
    });

    socket.on("user-left", ({ userCount: count, userName }) => {
      setUserCount(count);
      console.log(`${userName} left the room`);
    });

    // Handle users list updates
    socket.on("users-update", (users: User[]) => {
      setConnectedUsers(users);
      if (onUsersUpdate) {
        onUsersUpdate(users);
      }
    });

    // Handle cursor updates from other users
    socket.on(
      "cursor-moved",
      ({ userId, userName, position }: CursorPosition) => {
        updateRemoteCursor(userId, userName, position);
      }
    );

    return () => {
      socket.off("initial-code");
      socket.off("code-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("users-update");
      socket.off("cursor-moved");
    };
  }, [code, onChange, onUsersUpdate]);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set initial value if available
    if (value) {
      editor.setValue(value);
    }

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef.current) {
        socketRef.current.emit("cursor-update", {
          roomId,
          position: {
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          },
        });
      }
    });

    // Handle content changes
    editor.onDidChangeModelContent((e) => {
      if (!isUpdatingRef.current) {
        const newValue = editor.getValue();
        handleCodeChange(newValue);
      }
    });
  };

  // Update remote cursors
  const updateRemoteCursor = (
    userId: string,
    userName: string,
    position: CursorPosition["position"]
  ) => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;

    // Remove old decorations
    editor.deltaDecorations(decorationsRef.current, []);

    // Create new decoration for remote cursor
    const decorations = [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
        },
        options: {
          className: "remote-cursor",
          hoverMessage: { value: `${userName} (${userId})` },
          zIndex: 1000,
        },
      },
    ];

    decorationsRef.current = editor.deltaDecorations([], decorations);
  };

  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    if (!value || isUpdatingRef.current) return;

    setCode(value);
    if (onChange) onChange(value);

    // Emit code changes to other users
    if (socketRef.current) {
      socketRef.current.emit("code-change", {
        roomId,
        code: value,
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white px-2 py-1 rounded">
        {connected
          ? `${userCount} user${userCount !== 1 ? "s" : ""} connected`
          : "Connecting..."}
      </div>
      <Editor
        value={code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        height="100%"
        width="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default TextArea;
