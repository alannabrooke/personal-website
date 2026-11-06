"use client";

import { Toolbar } from "./ui";

export function Trash() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Toolbar inset className="border-b border-black/10">
        <h2 className="text-[15px] font-bold text-black/85">Trash</h2>
      </Toolbar>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-black/40">
        <p className="text-[15px] font-medium">Trash is empty</p>
        <p className="text-[12px]">Only good ideas here.</p>
      </div>
    </div>
  );
}
