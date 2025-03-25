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
        <div className="bg-gray-300 h-8 px-4 py-1 rounded-t-md border-[0.2px] border-gray-400">
          <p>{title}</p>
        </div>
      )}
      <div
        className="border-[0.3px] border-gray-200 rounded-lg p-4 overflow-hidden mt-0 
                    bg-white bg-[linear-gradient(90deg,transparent_1px,#fff_0),linear-gradient(transparent_1px,#fff_0)] 
                    bg-[size:22px_22px] [background-position:center_center]"
      >
        <div className={`flex flex-col ${centered && "items-center"}`}>
          {children}
        </div>
      </div>
    </>
  );
}
