import { allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";
import MDXContent from "@/app/components/MDX/MDXContent";
import {mdxComponents} from "@/app/components/MDX/MDXComponents";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Find the post for the current page.
  const {slug} = await params;
  const post = allPosts.find(
    (post: any) => post._raw.flattenedPath === slug
  );

  // 404 if the post does not exist.
  if (!post) notFound();

  return (
    <div>
      <MDXContent code={post.body.code} components={mdxComponents}/>
    </div>
  );
}
