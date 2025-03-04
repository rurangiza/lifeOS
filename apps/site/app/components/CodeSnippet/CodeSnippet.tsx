import React, { ComponentPropsWithoutRef } from "react";
import { Code } from "bright";
import myTheme from "./theme.json";
import { Fira_Code } from "next/font/google";

export const fira_code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fire-code",
});

Code.theme = myTheme;

export default function CodeSnippet({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  // Inline code block
  if (!className?.includes("language-")) {
    return (
      <code className="bg-[#EBEAEB] rounded-sm text-sm p-0.5" {...props}>
        {children}
      </code>
    );
  }

  let lang: string | undefined = className.replace("language-", "");
  return (
    <div className={fira_code.className}>
      <Code
        lang={lang ? lang : "javascript"}
        title={lang}
        lineNumbers
        className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
      >
        {children as string}
      </Code>
    </div>
  );
}
