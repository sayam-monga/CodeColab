"use client"; // Ensure this is at the top
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconLogin,
  IconUsers,
} from "@tabler/icons-react";
import { FlipWords } from "../ui/flip-words";
import { v4 as uuidV4 } from "uuid";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router

export default function SignupForm() {
  const router = useRouter(); // This should now work correctly
  const words = ["Colab", "Together", "Explore", "Master"];
  const [roomId, setRoomId] = useState("");

  // Create a new room and generate a unique ID
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    router.push(`/Editor/${id}`); // Redirect to the new room
  };

  // Join an existing room
  const joinRoom = () => {
    if (!roomId) {
      console.log("No room ID provided!");
      return;
    }

    console.log("Navigating to room:", roomId);
    // Redirect
    router.push(`/Editor/${roomId}`);
  };

  // Handle Enter key press
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <div className="headText">
        <div className="text-4xl mx-auto font-semibold text-neutral-600 dark:text-neutral-400">
          Code
          <FlipWords words={words} /> <br />
          <span className="text-2xl">Code Together - Learn Together</span>
        </div>
      </div>

      <form className="my-8">
        <LabelInputContainer className="mb-4">
          <Label htmlFor="code">Session Code</Label>
          <Input
            id="code"
            placeholder="7fa69203-1634-415b-bd0f-f2046ec10409"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
            type="text"
          />
        </LabelInputContainer>
        <Button
          onClick={joinRoom}
          type="button" // Ensure this button does not act as a form submit button
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg my-1 py-6"
        >
          <IconLogin className="mr-2 h-5 w-5" /> Join a Room
        </Button>
        <div className="justify-center text-center items-center">OR</div>
        <Button
          onClick={createNewRoom}
          type="button" // Ensure this button does not act as a form submit button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg my-1 py-6"
        >
          <IconUsers className="mr-2 h-5 w-5" /> Create Room
        </Button>
        <p className="text-center text-xs my-1 text-gray-500">
          You need to be logged in to create or join a room.
        </p>
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent mt-8 mb-2 h-[1px] w-full" />
        <div className="justify-center text-center items-center mb-4">
          Login
        </div>
        <div className="flex flex-col space-y-4">
          <button
            className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="button"
          >
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              GitHub
            </span>
            <BottomGradient />
          </button>
          <button
            className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="button"
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Google
            </span>
            <BottomGradient />
          </button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
