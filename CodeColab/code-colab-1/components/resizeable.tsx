"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import TextArea from "./textEditor";
import { FloatingDock } from "./ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconCopy,
  IconXboxXFilled,
  IconPlus,
  IconPlayerPlayFilled,
  IconUser,
} from "@tabler/icons-react";
import { FloatingList } from "./ui/floating-list";

export function EditorLayout() {
  const links = [
    {
      title: "End Session",
      icon: (
        <IconXboxXFilled className="h-full w-full  text-red-500 dark:text-red-500" />
      ),
      href: "#",
    },

    {
      title: "Copy Sesion ID",
      icon: (
        <IconCopy className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    // {
    //   title: "Add Member",
    //   icon: (
    //     <IconPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    //   ),
    //   href: "#",
    // },
  ];
  function submitCode() {
    console.log("submit code");
  }
  const link1 = [
    {
      title: "Run Code",
      icon: (
        <IconPlayerPlayFilled className="h-full w-full text-green-500 dark: text-green-500" />
      ),
      href: "#",
      onclick: { submitCode },
    },
  ];
  const link2 = [
    {
      title: "Connected Members",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ];
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-screen  bg-black  "
    >
      <ResizablePanel defaultSize={70} minSize={50} maxSize={70}>
        <div className="relative flex h-screen items-center justify-center">
          <TextArea />
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
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={50} maxSize={70}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Output</span>
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
