"use client";

import { ReactNode } from "react";

interface CanvasProps {
  children: ReactNode;
  centered?: boolean;
  title?: string;
}

export default function Canvas({
  children,
  centered = true,
  title,
}: CanvasProps) {
  return (
    <>
      {title && (
        <div className="text-sm bg-[#F7F7F8] rounded-t-md border-[0.2px] border-b-0 border-[#EDEDED] px-8 py-4">
          {title}
        </div>
      )}
      <div
        className={`border-[0.3px] border-gray-200 ${title ? "rounded-b-lg" : "rounded-lg"} py-4 px-8 overflow-hidden mt-0 
                    bg-white bg-[linear-gradient(90deg,transparent_1px,#fff_0),linear-gradient(transparent_1px,#fff_0)] 
                    bg-[size:22px_22px] [background-position:center_center]`}
      >
        <div className={`flex flex-col ${centered && "items-center"}`}>
          {children}
        </div>
      </div>
    </>
  );
}
