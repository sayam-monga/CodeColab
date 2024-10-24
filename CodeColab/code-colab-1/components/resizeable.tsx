"use client";
import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import TextArea from "./textEditor";
import { FloatingDock } from "./ui/floating-dock";
import {
  IconCopy,
  IconPlayerPlayFilled,
  IconUser,
  IconXboxXFilled,
} from "@tabler/icons-react";
import { FloatingList } from "./ui/floating-list";
import Terminal from "./terminal";
import XTerminal from "./terminal";

interface EditorLayoutProps {
  roomId: string;
}

export function EditorLayout({ roomId }: EditorLayoutProps) {
  // Links for various actions
  const links = [
    {
      title: "End Session",
      icon: (
        <IconXboxXFilled className="h-full w-full text-red-500 dark:text-red-500" />
      ),
      onClick: () => handleAction("End"),
    },
    {
      title: "Copy Session ID",
      icon: (
        <IconCopy className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => handleAction("Copy"),
    },
  ];

  const link1 = [
    {
      title: "Run Code",
      icon: (
        <IconPlayerPlayFilled className="h-full w-full text-green-500 dark:text-green-500" />
      ),
      onClick: () => handleAction("Run"),
    },
  ];

  const link2 = [
    {
      title: "Connected Members",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => handleAction("Members"),
    },
  ];

  // Generalized action handler
  const handleAction = (action: string) => {
    console.log(action);
    // Implement action logic here
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-screen min-h-screen bg-black"
    >
      <ResizablePanel defaultSize={15} maxSize={20}>
        <div className="relative flex h-full items-center justify-center">
          File System
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30} maxSize={60}>
        <div className="relative flex h-full items-center justify-center">
          <TextArea roomId="174226be-1f8f-4fb8-8f94-b242301c259f" />
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex flex-row">
              <FloatingDock items={links} />

              <div className="ml-2">
                <FloatingList items={link2} />
              </div>

              <div className="submit ml-2">
                <FloatingDock items={link1} />
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={30}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <XTerminal />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Feed</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
