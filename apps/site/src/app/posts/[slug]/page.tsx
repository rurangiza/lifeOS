'use server';

// app/posts/[slug]/page.tsx
import { allPosts } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import { notFound } from "next/navigation";
// import Link from "next/link";
// import type { MDXComponents } from "mdx/types";
// import { use } from "react";

import React, { ComponentPropsWithoutRef } from "react";
// import CodeSnippet from "@/app/components/CodeSnippet/CodeSnippet";
// import Image from "@/app/components/Image/Image";
import MDXContent from "@/app/components/MDX/MDXContent";
import {mdxComponents} from "@/app/components/MDX/MDXComponents";

// import { MDXContent } from "@/app/components/MDXContent/MDXContent";

// type HeadingProps = ComponentPropsWithoutRef<"h1">;
// type ParagraphProps = ComponentPropsWithoutRef<"p">;
// type ListProps = ComponentPropsWithoutRef<"ul">;
// type ListItemProps = ComponentPropsWithoutRef<"li">;
// type AnchorProps = ComponentPropsWithoutRef<"a">;
// type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;
// type ImageProps = ComponentPropsWithoutRef<"img">;
// type HighlightProps = ComponentPropsWithoutRef<"mark">;




export default async function Page({
  params,
}: {
  // params: Promise<{ slug: string }>;
  params: { slug: string }
}) {
  // Find the post for the current page.
  const {slug} = await params;
  const post = allPosts.find(
    (post: any) => post._raw.flattenedPath === slug
  );

  // 404 if the post does not exist.
  if (!post) notFound();

  // Parse the MDX file via the useMDXComponent hook.
  // const MDXContent = useMDXComponent(post.body.code);

  return (
    <div>
      {/* Some code ... */}
      {/* <MDXContent code={post.body.code} components={mdxComponents} /> */}
      <MDXContent code={post.body.code} components={mdxComponents}/>
    </div>
  );
}
