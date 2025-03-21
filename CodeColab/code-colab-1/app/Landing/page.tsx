"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

export default function () {
  <div className="container flex flex-row  w-screen h-screen">
    <div className="w-2/3 dark:bg-yellow-500">
      <div className="h-[40rem] w-full flex items-center justify-center  overflow-hidden">
        <MaskContainer
          revealText={
            <p className="max-w-4xl mx-auto text-slate-800 text-center  text-4xl font-bold">
              The first rule of MRR Club is you do not talk about MRR Club. The
              second rule of MRR Club is you DO NOT talk about MRR Club.
            </p>
          }
          className="h-[40rem] border rounded-md"
        >
          The first rule of <span className="text-red-500">MRR Club</span> is
          you do not talk about MRR Club. The second rule of MRR Club is you DO
          NOT talk about <span className="text-red-500">MRR Club</span>.
        </MaskContainer>
      </div>
    </div>
    <div className="w-1/3 bg-orange-500"></div>
  </div>;
}
