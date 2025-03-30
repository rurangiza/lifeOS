"use client";

import Link from "next/link";
import Image from "@/app/components/Image/Image";
import { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import CodeSnippet from "@/app/components/CodeSnippet/CodeSnippet";
import Canvas from "@/app/components/Canvas/Canvas";
import { Callout } from "@/app/components/Callout/Callout";
import GoHome from "@/app/components/GoHome/GoHome";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;
type ImageProps = ComponentPropsWithoutRef<"img">;
type HighlightProps = ComponentPropsWithoutRef<"mark">;

export const mdxComponents: MDXComponents = {
  h5: (props: HeadingProps) => (
    <h5 {...props} className="text-sm text-gray-400 mt-0 mb-4"></h5>
  ),
  h6: (props: HeadingProps) => (
    <h6 {...props} className="inline-block border- px-4 py-1 text-sm rounded-full mt-0 mb-4 bg-gray-200"></h6>
  ),
  p: (props: ParagraphProps) => (
    <p className=" text-gray-800" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol className="text-gray-800 list-decimal pl-5 space-y-1 mb-4 marker:text-[#4242f9]" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="text-gray-800 list-disc pl-5 space-y-1 mb-4 marker:text-[#4242f9]" {...props} />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="font-medium" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className = "text-blue-500 hover:text-blue-700";
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith("#")) {
      return (
        <a
          href={href}
          className="text-purple-500 hover:text-purple-700"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({
    children,
    className,
    ...props
  }: ComponentPropsWithoutRef<"code">) => (
    <CodeSnippet className={className} {...props}>
      {children}
    </CodeSnippet>
  ),
  blockquote: ({...props}) => (
    <blockquote
      {...props}
      className="text-center text-2xl font-[500] italic ml-[0.075em] text-red-600"
    />
  ),
  img: (props: ImageProps) => <Image {...props} />,
  hr: () => <hr className="w-48 m-auto h-0.5 text-gray-300 my-8" />,
  mark: (props: HighlightProps) => (
    <mark {...props} className="bg-[#ffff75b8]"></mark>
  ),
  selection: (props: HighlightProps) => (
    <mark {...props} style={{ backgroundColor: "yellow" }}></mark>
  ),
  Canvas: (props) => <Canvas {...props}></Canvas>,
  Callout: ({ children, mode }) => <Callout mode={mode}>{children}</Callout>,
  GoHome: () => <GoHome/>
};
