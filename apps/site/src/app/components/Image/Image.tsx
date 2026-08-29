import React, { ComponentPropsWithoutRef } from "react";
type ImageProps = ComponentPropsWithoutRef<"img">;
import { default as LocalImage } from "next/image";

export default function Image({ src, alt }: ImageProps) {
  return (
    <>
      <LocalImage
        width={500}
        height={200}
        alt={alt || ""}
        src={src || ""}
        className="border-2 rounded-2xl w-full shadow-xl"
      />
      <span className="block mt-4 text-center text-sm text-gray-500 -mt-3 mb-3">{alt}</span>
    </>
  );
}
