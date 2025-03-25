import React, { ComponentPropsWithoutRef } from "react";
import { Fira_Code } from "next/font/google";

export const fira_code = Fira_Code({
  subsets: ["latin"],
});

export default function CodeSnippet({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  // Inline code block
  if (!className?.includes("language-")) {
    return (
      <code className="text-sm text-red-500 bg-[#EBEAEB] px-1.5 rounded-sm p-0.5" {...props}>
        {children}
      </code>
    );
  }

  const lang: string | undefined = className.replace("language-", "");
  return (
    <div>
      {/* add syntax highlighter here */}
      {children as string}
    </div>
  );
}
