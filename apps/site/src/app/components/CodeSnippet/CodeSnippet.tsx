import React, { ComponentPropsWithoutRef } from "react";
import { fira_code } from "styles/fonts";

export default function CodeSnippet({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  // Inline code block
  if (!className?.includes("language-")) {
    return (
      <code
        style={fira_code.style}
        className=" text-red-500 bg-[#EBEAEB] px-2 rounded-sm py-0.5 text-[16px]"
        {...props}
      >
        {children}
      </code>
    );
  }

  const lang: string | undefined = className.replace("language-", "");
  return <div>{children as string}</div>;
}
